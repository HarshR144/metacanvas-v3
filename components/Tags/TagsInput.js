import React, { useState } from 'react';
import { X } from 'lucide-react';
import formStyle from "../../AccountPage/Form/Form.module.css";
const TagsInput = ({ tags, setTags, placeholder = "Add tags..." }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove last tag if backspace is pressed on empty input
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      setTags([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="tags-container">
      <div className={formStyle.Form_box_input_box}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
        />
      </div>
      
      {tags.length > 0 && (
        <div className="tags-display">
          {tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="tag-remove"
                aria-label={`Remove ${tag} tag`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      <style jsx>{`
        .tags-container {
          width: 100%;
        }

        .tags-input-wrapper {
          position: relative;
        }

        .tags-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.2s ease;
          background-color: #ffffff;
        }

        .tags-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .tags-display {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          color: #495057;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .tag:hover {
          background-color: #e9ecef;
          border-color: #adb5bd;
        }

        .tag-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          padding: 2px;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .tag-remove:hover {
          color: #dc3545;
          background-color: #f5c6cb;
        }

        .tag-remove:focus {
          outline: 2px solid #007bff;
          outline-offset: 1px;
        }

        @media (max-width: 768px) {
          .tags-input {
            font-size: 16px; /* Prevents zoom on iOS */
          }
          
          .tag {
            font-size: 13px;
            padding: 5px 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default TagsInput;