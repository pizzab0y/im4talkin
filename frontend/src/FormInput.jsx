import { useState } from "react";
// import "./formInput.css";

const FormInput = (props) => {
  const [focused, setFocused] = useState(false);
  const { label, errorMessage, onChange, id, depends, alternative, ...inputProps } = props;

  const handleFocus = (e) => {
    setFocused(true);
  };

  return (
    <div className="formInput mt-4">
      <div className="">
        <label
          className={
            label.length > 30
            ? "block font-semibold w-full py-2 float-left"
            : "block font-semibold w-1/2 py-2 pr-2 float-left"
          } 
        >{label}
        </label>
        {alternative ? (
          <ul
            className="block w-full text-sm font-medium text-gray-900 bg-white rounded sm:flex
            outline outline-offset-0 outline-1 outline-gray-300"
          >
            <li className="w-full">
              <div className="flex items-center ps-3">
                <input
                  id="horizontal-list-radio-license"
                  type="radio"
                  value="Yes"
                  name="list-radio"
                  className="w-4 h-4 text-[#003282] focus:ring-blue-500/20 focus:ring-2"
                />
                <label 
                  htmlFor="horizontal-list-radio-license"
                  className="w-full py-2 ms-2 text-sm font-medium text-gray-900"
                >
                  Yes
                </label>
              </div>
            </li>
            <li
              className="w-full"
            >
              <div className="flex items-center ps-3">
                <input
                  id="horizontal-list-radio-id"
                  type="radio"
                  value="No"
                  name="list-radio"
                  className="w-4 h-4 text-[#003282] focus:ring-blue-500/20 focus:ring-2"
                />
                <label
                  htmlFor="horizontal-list-radio-id"
                  className="w-full py-2 ms-2 text-sm font-medium text-gray-900"
                >
                  No
                </label>
              </div>
            </li>
          </ul>
          ) : (
          <input
            {...inputProps}
            className={
              label.length > 30
              ? "block w-full p-2 border-0 rounded ring-1 ring-gray-300 focus:ring-2 focus:ring-inset"
              : "block w-1/2 p-2 border-0 rounded ring-1 ring-gray-300 focus:ring-2 focus:ring-inset"
            } 
            onChange={onChange}
            onBlur={handleFocus}
            onFocus={() =>
              inputProps.name === "confirmPassword" && setFocused(true)
            }
            focused={focused.toString()}
          />  
        )}

        
        

      </div>
      <p className="mt-2 text-sm italic text-gray-400">{errorMessage}</p>
    </div>
  );
};

export default FormInput;