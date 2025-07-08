# - fastapi: For creating the API server
# - HTTPException: For error handling
# - CORSMiddleware: To allow cross-origin requests from Next.js frontend
# - pydantic: For input validation
# - spacy: For NLP processing
# - EntityRuler: For rule-based skill matching
# - json/os: For loading skills.json
# - typing: For type hints
# - lru_cache: For in-memory caching
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
from spacy.pipeline import EntityRuler
import json
import os
from typing import List, Set
from functools import lru_cache

# Initialize the FastAPI application
app = FastAPI()

# Configure CORS middleware to allow requests from specific origins (Next.js frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://www.honeyourcraft.xyz"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load spaCy NLP model with word vectors for similarity matching
try:
    nlp = spacy.load("en_core_web_md", disable=["ner"])
except Exception as e:
    raise Exception(f"Error loading spaCy model: {e}")

# Load predefined skills from skills.json file
# - Read skills.json from the current working directory
# - skills.json is generated from skillKeywords.ts in the Next.js app
# - Handle errors if file is missing or malformed
skills_file = "./skills.json"
try:
    if not os.path.exists(skills_file):
        raise FileNotFoundError(f"{skills_file} not found in {os.getcwd()}")
    with open(skills_file, "r", encoding="utf-8") as f:
        skill_keywords = json.load(f)
except Exception as e:
    raise Exception(f"Error loading skills.json: {e}")

# Pre-process skills into spaCy Doc objects for efficient similarity comparison
skill_docs = {skill_data["name"]: nlp(skill_data["name"]) for skill_data in skill_keywords.values()}

# Initialize spaCy EntityRuler to match known skills and dynamic technical terms
ruler: EntityRuler = nlp.add_pipe("entity_ruler") if "entity_ruler" not in nlp.pipe_names else nlp.get_pipe("entity_ruler")
# - Create patterns for known skills from skills.json and dynamic technical term patterns
skill_patterns = [
# Exact matches for known skills from skills.json (e.g., "Java", "React Native")
    {"label": "SKILL", "pattern": skill_data["name"]} for skill_data in skill_keywords.values()
] + [
        # Dynamic patterns for technical terms
{"label": "SKILL", "pattern": [{"TEXT": {"REGEX": r"^[A-Z][a-z]+[A-Z][a-z]+"}}]},
    {"label": "SKILL", "pattern": [{"TEXT": {"REGEX": r"^[A-Z]{2,}$"}}]},
    {"label": "SKILL", "pattern": [{"TEXT": {"REGEX": r"^[a-zA-Z]+\.[a-zA-Z]+"}}]},
    {"label": "SKILL", "pattern": [{"TEXT": {"REGEX": r"^[a-zA-Z]+-[a-zA-Z]+"}}]},
    {"label": "SKILL", "pattern": [{"POS": "PROPN", "OP": "+"}, {"POS": "NOUN", "OP": "*"}]},
    {"label": "SKILL", "pattern": [{"LOWER": {"IN": ["graphql", "langchain", "vite", "nextjs"]}}]}
]
ruler.add_patterns(skill_patterns)

# Define Pydantic model for incoming job description data
class JobDescription(BaseModel):
    description: str

# Define function to extract skills from a job description, with in-memory caching
# - Use lru_cache to store results for up to 1000 unique descriptions
# - Input: description (string)
# - Output: List of extracted skill names@lru_cache(maxsize=1000)
def extract_skills_single(description: str) -> List[str]:
    # Return empty list if description is empty
    if not description:
        return []
    # Process the job description with spaCy to create a Doc object
    # - Tokenize, lemmatize, and parse the text for further analysis
    doc = nlp(description)
    # Initialize a set to store unique extracted skills
    extracted_skills: Set[str] = set()
    # Set similarity threshold for embedding-based matching
    similarity_threshold = 0.85
    # Extract exact skill matches using EntityRuler
    # - Iterate over detected entities labeled as "SKILL" (from skills.json and dynamic patterns)
    # - Filter by requirement context to ensure relevance
    for ent in doc.ents:
        if ent.label_ == "SKILL":
            for token in doc[ent.start:ent.end]:
                if token.dep_ in ["dobj", "pobj"] and token.head.text.lower() in ["require", "need", "use", "experience"]:
                    extracted_skills.add(ent.text)
                    break
    # Process noun chunks to extract multi-word skills
    # - Iterate over noun phrases (e.g., "React Native", "machine learning")
    for chunk in doc.noun_chunks:
        chunk_text = chunk.text.strip()
    # Skip if already extracted by EntityRuler
        if chunk_text in extracted_skills:
            continue
    # Re-process chunk to get embeddings
        chunk_doc = nlp(chunk_text)
    # Check similarity against known skills for variations (e.g., "React.js" vs. "React")
        for skill, skill_doc in skill_docs.items():
            similarity = chunk_doc.similarity(skill_doc)
            if similarity > similarity_threshold:
                extracted_skills.add(skill)
                break
    # Apply heuristic to detect new skills not in skills.json
    # - Lemmatize chunk to normalize text (e.g., "programming" -> "program")
        lemma = " ".join(token.lemma_ for token in chunk_doc if token.is_alpha)
        if lemma not in extracted_skills and len(lemma) > 2:
    # Check for technical characteristics:
    # - Uppercase letters, acronyms, dot notation, hyphenated terms, or proper noun sequences
    # - Noun or proper noun POS tags
            if (
                any(char.isupper() for char in chunk_text) or
                any(word.isupper() for word in chunk_text.split()) or
                "." in chunk_text or  # Dot notation
                "-" in chunk_text or  # Hyphenated terms
                any(token.pos_ in ["NOUN", "PROPN"] for token in chunk_doc)
            ):
    # Ensure chunk is in a requirement context
                for token in chunk_doc:
                    if token.dep_ in ["dobj", "pobj"] and token.head.text.lower() in ["require", "need", "use", "experience"]:
                        extracted_skills.add(chunk_text)
                        break

 # Process individual tokens to extract single-word skills
    # - Iterate over tokens that are alphabetic, not stop words, and have specific POS tags
    for token in doc:
        if token.is_alpha and not token.is_stop and token.pos_ in ["NOUN", "PROPN"] and token.text not in extracted_skills:
            lemma = token.lemma_
                       # Re-process token for embeddings

            token_doc = nlp(token.text)
                      # Check similarity for variations (e.g., "JS" vs. "JavaScript")

            for skill, skill_doc in skill_docs.items():
                similarity = token_doc.similarity(skill_doc)
                if similarity > similarity_threshold:
                    extracted_skills.add(skill)
                    break
                      # Apply heuristic for new single-word skills

            if lemma not in extracted_skills and len(lemma) > 2:
                if (
                    any(char.isupper() for char in token.text) or
                    "." in token.text or
                    "-" in token.text or
                    token.pos_ == "PROPN"
                ):
                                        # Check requirement context

                    if token.dep_ in ["dobj", "pobj"] and token.head.text.lower() in ["require", "need", "use", "experience"]:
                        extracted_skills.add(token.text)

    return list(extracted_skills)

# Define FastAPI endpoint to extract skills from a job description
# Define FastAPI endpoint to extract skills from a job description
# - Accept POST request with JobDescription payload
# - Call extract_skills_single and return results
# - Handle errors with HTTP 500
@app.post("/extract-skills", response_model=List[str])
async def extract_skills(job: JobDescription):
    try:
        return extract_skills_single(job.description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing description: {str(e)}")

# Define health check endpoint to verify server status
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
