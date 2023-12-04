import { useState } from "react";
// import "./app.css";
import FormInput from "./FormInput";

const Questionnaire = () => {
  const [values, setValues] = useState({
    name: "",
    age: "",
    nativeLanguage: "",
    profession: "",
    expertise: "",
    hobby: "",
    pets: "",
  });

  const inputs = [
    {
      id: 1,
      name: "name",
      type: "text",
      placeholder: "e.g. Sam",
      commentary:
        "Your name is vital when it comes to conversations with people who, due to their roles, usually know it.",
      errorMessage: "",
      label: "Tell me what's your name?",
      pattern: "^[A-Za-z0-9]{3,30}$",
      required: true,
    },
    {
      id: 2,
      name: "age",
      type: "integer",
      placeholder: "e.g. 38",
      commentary: "Highly recommend you provide your real age.",
      errorMessage: "",
      label: "And your age, please.",
      required: true,
    },
    {
      id: 3,
      name: "nativeLanguage",
      type: "text",
      placeholder: "e.g. Russian",
      label: "What is your native language?",
      required: true,
    },
    {
      id: 4,
      name: "profession",
      type: "text",
      placeholder: "e.g. AI developer",
      label: "What is your profession or field of study?",
    },
    {
      id: 5,
      name: "expertise",
      type: "text",
      placeholder: "e.g. expert",
      label: "What is your level of experience or expertise in your field of study or profession?",
      required: true,
      depends: "profession"
    },
    {
      id: 6,
      name: "hobby",
      type: "text",
      placeholder: "e.g. Survivalism",
      label: "What are your hobbies and interests?",
      required: true,
    },
    {
      id: 7,
      name: "pets",
      type: "text",
      label: "Do you have any pets or are you interested in animals?",
      alternative: true,
    },
    {
      id: 8,
      name: "pet_kind",
      type: "text",
      placeholder: "e.g. a dog",
      label: "What are these pets/animals?",
      dependsYes: "pets",
    },
    {
      id: 9,
      name: "books",
      type: "text",
      placeholder: "e.g. Yes",
      label: "Do you like read?",
      required: true,
    },

  ];

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const onChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <div className="questionaire flex flex-col p-4 bg-white rounded shadow w-full max-w-md space-y-4">
      <form onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Questionaire</h2>
        <p className="mb-2">To be relevant and useful exactly for you I need to know something about you.</p>
        <p className="mb-4">Please answer the questions below. Not a big deal for you. But the benefit you'll get...
        Uuuf! All the topics will fit perfectly with your personality,
        like the suit of Ironman for Tony Stark!
        </p>
        {inputs.map((input) => (
          (input.depends && !values[input.depends]) ? null : (
              <FormInput
              className="mb-4"
              key={input.id}
              {...input}
              value={values[input.name]}
              onChange={onChange}
            />
        )))}
        <button>Submit</button>
      </form>
    </div>
  );
};

export default Questionnaire;