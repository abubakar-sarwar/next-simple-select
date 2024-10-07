import { SimpleSelectProps } from "./types";

const SimpleSelect = ({ inputId }: SimpleSelectProps) => {
  return (
    <div>
      <input type="text" placeholder="Select" className="simple-select" />
    </div>
  );
};

export default SimpleSelect;
