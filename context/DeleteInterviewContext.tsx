import { createContext, useContext } from "react";

type DeleteInterview = (id: string) => void;

const DeleteInterviewContext = createContext<DeleteInterview>(() => {});

export const useDeleteInterview = () => useContext(DeleteInterviewContext);

export default DeleteInterviewContext;
