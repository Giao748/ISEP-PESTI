type Props = {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    type?: "button" | "submit" | "reset";
  };
  
  export const Button = ({ children, onClick, className = "", type = "button" }: Props) => {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-all font-semibold ${className}`}
      >
        {children}
      </button>
    );
  };
  