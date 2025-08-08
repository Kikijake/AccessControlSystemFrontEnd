import React from "react";

/**
 * A reusable skeleton loader for tables.
 * @param {object} props - The component props.
 * @param {number} [props.rows=5] - The number of skeleton rows to display.
 * @param {number} [props.cols=5] - The number of columns in each row.
 */
const SkeletonLoader = ({ rows = 5, cols = 5 }) => {
  // An array to create a variety of skeleton bar widths
  const widthClasses = ["w-3/4", "w-1/2", "w-5/6", "w-2/3", "w-full"];

  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
              <div
                className={`h-4 bg-gray-300 rounded ${
                  widthClasses[colIndex % widthClasses.length]
                }`}
              ></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default SkeletonLoader;
