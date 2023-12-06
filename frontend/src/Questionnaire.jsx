import { useState } from "react";
import FormInput from "./FormInput";

const Questionnaire = ({onQuestionnaireSubmit}) => {
  const [values, setValues] = useState({
    name: "",
    age: "",
    nativeLanguage: "",
    profession: "",
    expertise: "",
    hobby: "",
    pets: "",
    pets_kinds: "",
    books: "",
    books_genres: "",
  });

  const inputs = [
    {
      id: 1,
      name: "name",
      type: "text",
      placeholder: "e.g. Sam",
      commentary: "Your name is vital when it comes to conversations with people who, due to their roles, usually know it.",
      validation: "English letters and even digits! Your name should have length between 2 and 30 symbols",
      label: "Tell me what's your name?",
      pattern: "^[A-Za-z0-9]{2,30}$",
    },
    {
      id: 2,
      name: "age",
      type: "integer",
      placeholder: "e.g. 38",
      commentary: "Highly recommend you provide your real age.",
      validation: "Digits. 0, 1, 2, 6 and others you like",
      label: "And your age, please.",
      pattern: "^[0-9]{1,3}$",
    },
    {
      id: 3,
      name: "nativeLanguage",
      type: "text",
      placeholder: "e.g. Korean",
      label: "What is your native language?",
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
      depends: "profession"
    },
    {
      id: 6,
      name: "hobby",
      type: "text",
      placeholder: "e.g. survivalism",
      label: "What are your hobbies or interests?",
    },
    {
      id: 7,
      name: "sport",
      type: "text",
      placeholder: "e.g. wrestling, skiing",
      label: "What are your favorite sports or physical activities?",
    },
    {
      id: 8,
      name: "pets",
      type: "radio",
      label: "Do you have any pets or are you interested in animals?",
      alternative: true,
    },
    {
      id: 9,
      name: "pets_kinds",
      type: "text",
      placeholder: "e.g. a dog",
      label: "What are these pets/animals?",
      dependsanswer: "pets",
    },
    {
      id: 10,
      name: "books",
      type: "radio",
      label: "Do you like read?",
      alternative: true,
    },
    {
      id: 11,
      name: "books_genres",
      type: "text",
      placeholder: "e.g. sci-fi",
      label: "What are your favorite genres?",
      dependsanswer: "books",
    },
    {
      id: 12,
      name: "travel",
      type: "radio",
      label: "Do you travel often?",
      alternative: true,
    },
    {
      id: 13,
      name: "travel_directions",
      type: "text",
      placeholder: "e.g. Afghanistan",
      label: "What are your favorite directions?",
      dependsanswer: "travel",
    },
    {
      id: 14,
      name: "dietary",
      type: "radio",
      label: "Do you have any dietary preferences or restrictions?",
      alternative: true,
    },
    {
      id: 15,
      name: "dietary_preferences",
      type: "text",
      placeholder: "e.g. vegetarian",
      label: "What are your dietary preferences/restrictions?",
      dependsanswer: "dietary",
    },
    {
      id: 16,
      name: "dietary_preferences",
      type: "text",
      placeholder: "e.g. libertarianism, stoicism ",
      label: "If you have any topics or issues that you are passionate about and haven't mentioned yet, feel free to share them here:",
    },

  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onQuestionnaireSubmit();
  };

  const onChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    console.log(values[e.target.name]);
  };

  return (
    <div className="questionaire flex flex-col p-4 bg-white rounded shadow w-full max-w-md space-y-4 max-h-[80vh] overflow-auto">
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Questionaire</h2>
        <p className="mb-2">To be relevant and useful exactly for you I need to know something about you.</p>
        <p className="mb-4">Please answer the questions below.
        None of them is required.
        However, it isn't a big deal for you, is it?
        The benefits you'll get... Uuuf!
        All the topics will fit perfectly with your personality, like the Iron Man suit for Tony Stark!
        </p>
        {inputs.map((input) => (
          ((input.dependsanswer && values[input.dependsanswer] !== "Yes") |
            (input.depends && !values[input.depends])) ? null : (
            <FormInput
              className="mb-4"
              key={input.id}
              {...input}
              value={values[input.name]}
              onChange={onChange}
            />
          )
        ))}
        <button
          onClick={handleSubmit}
          className="mt-8 p-2 self-center rounded text-white bg-[#003282] w-16" 
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Questionnaire;