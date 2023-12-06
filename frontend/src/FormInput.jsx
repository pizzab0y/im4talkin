import { useState } from "react";

const FormInput = (props) => {
  const [focused, setFocused] = useState(false);
  const { label, errorMessage, onChange, validation, commentary, id, type, depends, alternative, ...inputProps } = props;

  const handleFocus = (e) => {
    setFocused(true);
  };

  return (
    <div className="formInput mt-4">
      <div className="">
        <label
          className={
            label.length > 30
            ? "block font-semibold w-full py-2"
            : "block font-semibold w-1/2 py-2 pr-2 float-left"
          } 
        >{label}
        </label>
        {alternative ? (
          <ul
            className="w-full text-sm text-gray-900 bg-white rounded flex ring-1 ring-gray-300"
          >
            <li className="w-1/2 self-start border-e border-gray-300">
              <div className="flex items-center ps-3">
                <input
                  {...inputProps}
                  type={type}
                  value="Yes"
                  onChange={onChange}
                  className="w-4 h-4 text-[#003282] focus:ring-blue-500/20 focus:ring-2"
                />
                <label 
                  className="w-full py-2 ms-2 text-sm text-gray-900"
                >
                  Yes
                </label>
              </div>
            </li>
            <li
              className="w-1/2 self-end"
            >
              <div className="flex items-center ps-3">
                <input
                  {...inputProps}
                  type={type}
                  value="No"
                  onChange={onChange}
                  className="w-4 h-4 text-[#003282] focus:ring-blue-500/20 focus:ring-2"
                />
                <label
                  className="w-full py-2 ms-2 text-sm text-gray-900"
                >
                  No
                </label>
              </div>
            </li>
          </ul>
          ) : (
          <input
            {...inputProps}
            type={type}
            className={
              label.length > 30
              ? "block w-full p-2 border-0 rounded ring-1 ring-gray-300 focus:ring-2 focus:ring-inset"
              : "block w-1/2 p-2 border-0 rounded ring-1 ring-gray-300 focus:ring-2 focus:ring-inset"
            } 
            onChange={onChange}
            title={validation}
            onBlur={handleFocus}
            onFocus={() =>
              inputProps.name === "confirmPassword" && setFocused(true)
            }
            focused={focused.toString()}
          />  
        )}
      </div>
      {commentary ? (
        <p className="mt-2 text-sm italic text-gray-400">{commentary }</p>
      ) : (null)}
    </div>
  );
};

export default FormInput;