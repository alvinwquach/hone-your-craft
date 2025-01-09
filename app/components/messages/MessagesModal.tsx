import Image from "next/image";
import { useState, useEffect } from "react";
import { FaTrash, FaPaperPlane, FaTimes } from "react-icons/fa";
import Select, { MultiValue, OptionProps } from "react-select";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const schema = z.object({
  selectedUsers: z
    .array(z.string())
    .min(1, "Please select at least one recipient"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

type FormData = z.infer<typeof schema>;

interface User {
  id: string;
  name: string;
  image: string;
  email: string;
}

interface MessageModalProps {
  closeModal: () => void;
  users: User[];
}

const MessageModal = ({ closeModal, users }: MessageModalProps) => {
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      selectedUsers: [],
      subject: "",
      message: "",
    },
  });

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [message, setMessage] = useState<string>("");
  const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([]);
  const [isMentioning, setIsMentioning] = useState<boolean>(false);

  useEffect(() => {
    const mentionPattern = /@([a-zA-Z0-9_]+)/g;
    const matches = [...message.matchAll(mentionPattern)];

    if (matches.length > 0) {
      const lastMention = matches[matches.length - 1];

      if (lastMention) {
        const mentionedText = lastMention[1]; // Text after "@"

        // If the next character isn't a space (meaning user is still typing the mention)
        if (message[lastMention.index! + lastMention[0].length] !== " ") {
          // Filter users based on the mentioned text after "@"
          const matchingUsers = selectedUsers.filter((user) =>
            user.name.toLowerCase().startsWith(mentionedText.toLowerCase())
          );
          setMentionSuggestions(matchingUsers);
          setIsMentioning(true);
        } else {
          setIsMentioning(false);
          setMentionSuggestions([]);
        }
      }
    } else {
      // If no mention matches but "@" is typed, show all users as suggestions
      if (message.includes("@")) {
        setMentionSuggestions(selectedUsers); // Show all selected users
        setIsMentioning(true);
      } else {
        setIsMentioning(false); // Hide suggestions if no "@" symbol
        setMentionSuggestions([]);
      }
    }
  }, [message, selectedUsers]);

  const handleMentionSelect = (user: User) => {
    const mentionPattern = /@([a-zA-Z0-9_]+)/g;
    const matches = [...message.matchAll(mentionPattern)];

    if (matches.length === 0) return;

    const lastMention = matches[matches.length - 1];
    if (!lastMention) return;

    const beforeText = message.slice(0, lastMention.index!);
    const afterText = message.slice(lastMention.index! + lastMention[0].length);

    const updatedMessage = `${beforeText}@${user.name} ${afterText}`;
    setMessage(updatedMessage);
    setMentionSuggestions([]);
  };

  // Handle form submission
  // const handleSend: SubmitHandler<FormData> = async (data) => {
  //   try {
  //     const receiverEmails = data.selectedUsers
  //       .map((userId) => users.find((user) => user.id === userId)?.email)
  //       .filter(Boolean);

  //     const mentionedUserIds = selectedUsers
  //       .filter((user) => message.includes(`@${user.name}`))
  //       .map((user) => user.id);

  //     console.log("Sending message with data:", {
  //       receiverEmails,
  //       messageContent: data.message,
  //       subject: data.subject,
  //       mentionedUserIds,
  //     });

  //     if (receiverEmails.length === 0) {
  //       toast.error("Please select valid recipients.", {
  //         position: "top-right",
  //         autoClose: 3000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //         progress: undefined,
  //       });
  //       return;
  //     }

  //     // Simulate sending the message (no real API call)
  //     toast.success("Message sent successfully!", {
  //       position: "top-right",
  //       autoClose: 3000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //     });
  //     console.log("Message sent successfully");

  //     // Close modal or reset state as needed
  //     closeModal();
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //     toast.error("An error occurred. Please try again.", {
  //       position: "top-right",
  //       autoClose: 3000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //     });
  //   }
  // };

  const handleSend: SubmitHandler<FormData> = async (data) => {
    try {
      // Get the receiver emails from selected users
      const receiverEmails = data.selectedUsers
        .map((userId) => users.find((user) => user.id === userId)?.email)
        .filter(Boolean);

      // Track mentioned user IDs
      const mentionedUserIds = selectedUsers
        .filter((user) => message.includes(`@${user.name}`))
        .map((user) => user.id);

      // Log the sending message data
      console.log("Sending message with data:", {
        receiverEmails,
        messageContent: data.message,
        subject: data.subject,
        mentionedUserIds,
      });

      // Check if valid recipients are selected
      if (receiverEmails.length === 0) {
        toast.error("Please select valid recipients.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }

      // Make the POST request to send the message
      const response = await fetch("/api/message/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverEmails: receiverEmails,
          content: data.message,
          messageType: "TEXT",
          mentionedUserIds: mentionedUserIds,
          subject: data.subject,
        }),
      });

      // Check if the response is successful
      if (response.ok) {
        toast.success("Message sent successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        console.log("Message sent successfully");

        // Notify mentioned users with a toast (or you could use email notifications)
        const mentionedUsers = selectedUsers.filter((user) =>
          mentionedUserIds.includes(user.id)
        );

        if (mentionedUsers.length > 0) {
          mentionedUsers.forEach((user) => {
            toast.info(`You were mentioned in a message: ${user.name}`, {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          });
        }
      } else {
        toast.error("Failed to send the message. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        console.log("Failed to send the message:", response.statusText);
      }

      // Close modal or reset state as needed
      closeModal();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  // const handleSend: SubmitHandler<FormData> = async (data) => {
  //   try {
  //     const receiverEmails = data.selectedUsers
  //       .map((userId) => users.find((user) => user.id === userId)?.email)
  //       .filter(Boolean);

  //     const mentionedUserIds = selectedUsers
  //       .filter((user) => message.includes(`@${user.name}`))
  //       .map((user) => user.id);

  //     console.log("Sending message with data:", {
  //       receiverEmails,
  //       messageContent: data.message,
  //       subject: data.subject,
  //       mentionedUserIds,
  //     });

  //     if (receiverEmails.length === 0) {
  //       toast.error("Please select valid recipients.", {
  //         position: "top-right",
  //         autoClose: 3000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //         progress: undefined,
  //       });
  //       return;
  //     }

  //     const response = await fetch("/api/message/send", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         receiverEmails: receiverEmails,
  //         content: data.message,
  //         messageType: "TEXT",
  //         mentionedUserIds: mentionedUserIds,
  //         subject: data.subject,
  //       }),
  //     });

  //     console.log("API response:", response);

  //     if (response.ok) {
  //       toast.success("Message sent successfully!", {
  //         position: "top-right",
  //         autoClose: 3000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //         progress: undefined,
  //       });
  //       console.log("Message sent successfully");
  //     } else {
  //       toast.error("Failed to send the message. Please try again.", {
  //         position: "top-right",
  //         autoClose: 3000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //         progress: undefined,
  //       });
  //       console.log("Failed to send the message:", response.statusText);
  //     }

  //     closeModal();
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //     toast.error("An error occurred. Please try again.", {
  //       position: "top-right",
  //       autoClose: 3000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //     });
  //   }
  // };

  // const handleSend: SubmitHandler<FormData> = async (data) => {
  //   try {
  //     // Extract the selected user emails from the form data
  //     const receiverEmails = data.selectedUsers
  //       .map((userId) => users.find((user) => user.id === userId)?.email)
  //       .filter(Boolean);

  //     // Extract the mentioned user IDs from the message
  //     const mentionedUserIds = selectedUsers
  //       .filter((user) => message.includes(`@${user.name}`))
  //       .map((user) => user.id);

  //     // Log the data for debugging purposes
  //     console.log("Preparing to send message with data:", {
  //       receiverEmails,
  //       messageContent: data.message,
  //       subject: data.subject,
  //       mentionedUserIds,
  //     });

  //     // Check if there are valid recipients
  //     if (receiverEmails.length === 0) {
  //       toast.error("Please select valid recipients.", {
  //         position: "top-right",
  //         autoClose: 3000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //         progress: undefined,
  //       });
  //       return;
  //     }

  //     // Log the mentioned users and their IDs
  //     mentionedUserIds.forEach((userId) => {
  //       const mentionedUser = selectedUsers.find((user) => user.id === userId);
  //       if (mentionedUser) {
  //         console.log(
  //           `Mentioned @${mentionedUser.name} with user ID: ${mentionedUser.id}`
  //         );
  //       }
  //     });

  //     // Show a toast to simulate the sending process
  //     toast.info("Message is being processed...", {
  //       position: "top-right",
  //       autoClose: 3000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //     });

  //     // Simulate a successful "send" process
  //     setTimeout(() => {
  //       toast.success("Message prepared successfully!", {
  //         position: "top-right",
  //         autoClose: 3000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //         progress: undefined,
  //       });
  //       console.log("Message prepared successfully!");
  //     }, 1500); // Simulate some processing delay

  //     // You can close the modal or perform other UI updates here
  //     closeModal();
  //   } catch (error) {
  //     // Log any error that occurs in the try block
  //     console.error("Error preparing message:", error);

  //     // Show an error toast if something goes wrong
  //     toast.error("An error occurred. Please try again.", {
  //       position: "top-right",
  //       autoClose: 3000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //     });
  //   }
  // };

  const handleTrash = () => {
    reset({
      subject: "",
      message: "",
    });
    setSelectedUsers([]);
  };

  const userOptions = users?.map((user) => ({
    value: user.id,
    label: user.name,
    image: user.image,
    name: user.name,
    id: user.id,
    email: user.email,
  }));

  const handleUserSelectChange = (newValue: MultiValue<any>) => {
    setSelectedUsers([...newValue]);
  };

  interface CustomOptionProps extends OptionProps<User, true> {}

  const CustomOption = ({ data, innerRef, innerProps }: CustomOptionProps) => {
    return (
      <div ref={innerRef} {...innerProps} className="flex items-center p-2">
        <Image
          src={data.image}
          alt={data.name}
          width={32}
          height={32}
          className="rounded-full mr-3"
        />
        <div>
          <div className="text-black">{data.name}</div>
        </div>
      </div>
    );
  };

  const CustomSingleValue = (props: any) => {
    const { data } = props;
    return (
      <div className="flex items-center">
        <Image
          src={data.image}
          alt={data.name}
          className="w-8 h-8 rounded-full mr-3"
        />
        <div>
          <div className="text-white">{data.name}</div>
        </div>
      </div>
    );
  };

  const customSelectStyles = {
    control: (styles: any) => ({
      ...styles,
      backgroundColor: "#171717",
      borderColor: "#333",
      color: "#fff",
      borderRadius: "0.375rem",
      padding: "0.5rem",
    }),
    input: (styles: any) => ({
      ...styles,
      color: "#fff",
    }),
    placeholder: (styles: any) => ({
      ...styles,
      color: "#bbb",
    }),
    option: (styles: any) => ({
      ...styles,
      backgroundColor: "#2c2c2c",
      color: "#eee",
      ":hover": {
        backgroundColor: "#444",
      },
    }),
    multiValue: (styles: any) => ({
      ...styles,
      backgroundColor: "#444",
      color: "#fff",
    }),
    multiValueLabel: (styles: any) => ({
      ...styles,
      color: "#fff",
    }),
    multiValueRemove: (styles: any) => ({
      ...styles,
      color: "#fff",
      ":hover": {
        backgroundColor: "#e11d48",
      },
    }),
  };

  const customInputStyles = {
    backgroundColor: "#171717",
    borderColor: "#333",
    color: "#fff",
    borderRadius: "0.375rem",
    padding: "0.75rem",
    width: "100%",
    marginTop: "0.5rem",
  };

  const renderMessageWithMentions = (message: string) => {
    // Define a regular expression to match mentions.
    const mentionPattern = /(@[a-zA-Z0-9_]+)/g;

    // Replace mentions with highlighted text
    return message.split(mentionPattern).map((part, index) => {
      // If part matches the mention pattern, highlight it
      if (part.match(mentionPattern)) {
        return (
          <span key={index} className="bg-yellow-200 font-semibold">
            {part}
          </span>
        );
      }
      return part; // For non-mention parts, just return the text
    });
  };

  return (
    <div className="fixed inset-0 flex items-end justify-end z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={closeModal}
      ></div>
      <div className="bg-zinc-800 w-full lg:w-1/3 rounded-lg p-6 shadow-lg transform transition-transform duration-300 ease-in-out animate-slide-up">
        <div className="absolute top-4 right-4">
          <button onClick={closeModal} className="text-white text-2xl">
            <FaTimes />
          </button>
        </div>
        <h2 className="text-xl font-semibold mb-4 text-white">Send Message</h2>
        <form onSubmit={handleSubmit(handleSend)} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400">Recipients:</label>
            <Controller
              control={control}
              name="selectedUsers"
              render={({ field }) => (
                <Select
                  isMulti
                  options={userOptions}
                  value={selectedUsers}
                  onChange={(newValue) => {
                    field.onChange(newValue.map((item: any) => item.value));
                    handleUserSelectChange(newValue);
                  }}
                  className="mt-2"
                  placeholder="Select users"
                  styles={customSelectStyles}
                  components={{
                    Option: CustomOption,
                    SingleValue: CustomSingleValue,
                  }}
                />
              )}
            />
            {errors.selectedUsers && (
              <p className="text-xs text-red-400">
                {errors.selectedUsers.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400" htmlFor="subject">
              Subject:
            </label>
            <Controller
              control={control}
              name="subject"
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  placeholder="Subject"
                  style={customInputStyles}
                />
              )}
            />
            {errors.subject && (
              <p className="text-xs text-red-400">{errors.subject.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400" htmlFor="message">
              Message:
            </label>
            <Controller
              name="message"
              control={control}
              rules={{ required: "Message is required" }}
              render={({ field }) => (
                <textarea
                  {...field}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    field.onChange(e);
                  }}
                  placeholder="Write your message here"
                  rows={4}
                  className="p-2 border rounded-md w-full"
                  style={customInputStyles}
                />
              )}
            />
            {errors.message && (
              <p className="text-red-500 text-xs mt-1">
                {errors.message.message}
              </p>
            )}
            {mentionSuggestions.length > 0 && isMentioning && (
              <div className="text-white rounded-lg">
                <ul>
                  {mentionSuggestions.map((user) => (
                    <li
                      key={user.id}
                      className="cursor-pointer flex items-center hover:bg-gray-700 rounded"
                      style={customInputStyles}
                      onClick={() => handleMentionSelect(user)}
                    >
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={24}
                        height={24}
                        className="rounded-full mr-2"
                      />
                      {user.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {errors.message && (
              <p className="text-xs text-red-400">{errors.message.message}</p>
            )}
          </div>
          <div className="flex justify-between gap-x-6 mt-4">
            <button
              type="submit"
              className="flex items-center px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full shadow-md transition-all duration-200 ease-in-out"
            >
              <FaPaperPlane className="w-4 h-4 mr-2" />
              Send
            </button>
            <button
              type="button"
              onClick={handleTrash}
              className="flex items-center justify-center px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-full shadow-md transition-all duration-200 ease-in-out"
            >
              <FaTrash className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageModal;
