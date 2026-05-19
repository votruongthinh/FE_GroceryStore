import React from "react";
import { ChevronRight } from "lucide-react";

const Breadcrumb = ({ items }) => {
  return (
    <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-3 w-3 text-gray-300" />}
          <span className={item.active ? "text-primary" : ""}>
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;
