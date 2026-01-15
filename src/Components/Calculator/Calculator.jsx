import React, { useState, useEffect } from "react";
import { Button, Input, Typography } from "antd";
import { CalculatorOutlined, ClearOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import "./Calculator.css";

const { Text } = Typography;

const Calculator = ({ onClose }) => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState([]);
  const [calculationHistory, setCalculationHistory] = useState([]); // Step-wise history
  const [currentExpression, setCurrentExpression] = useState(""); // Current calculation being performed
  const [escPressCount, setEscPressCount] = useState(0);
  const [pressedKey, setPressedKey] = useState(null); // Track which key/button is currently pressed
  const escTimeoutRef = React.useRef(null);
  
  // Refs to store latest values for keyboard handler
  const displayRef = React.useRef(display);
  const previousValueRef = React.useRef(previousValue);
  const operationRef = React.useRef(operation);
  const escPressCountRef = React.useRef(escPressCount);
  
  // Refs to store handler functions
  const handlersRef = React.useRef({});

  // Format number helper function
  const formatNumber = (num) => {
    if (num === "Error") return num;
    const number = parseFloat(num);
    if (isNaN(number)) return num;
    // Format with commas for thousands
    return number.toLocaleString("en-US", {
      maximumFractionDigits: 10,
    });
  };

  // Update refs when state changes
  React.useEffect(() => {
    displayRef.current = display;
    previousValueRef.current = previousValue;
    operationRef.current = operation;
    escPressCountRef.current = escPressCount;
  }, [display, previousValue, operation, escPressCount]);

  useEffect(() => {
    // Focus on display when component mounts
    const displayElement = document.getElementById("calc-display");
    if (displayElement) {
      displayElement.focus();
    }

    // Keyboard event handler
    const handleKeyPress = (e) => {
      // Don't handle if user is typing in an input field (except our calculator display)
      const activeElement = document.activeElement;
      const isInputField =
        (activeElement?.tagName === "INPUT" && activeElement.id !== "calc-display") ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.contentEditable === "true";

      if (isInputField) {
        return;
      }

      // Get handlers from ref
      const handlers = handlersRef.current;

      // Handle number keys (0-9)
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        setPressedKey(`num-${e.key}`);
        handlers.handleNumber?.(parseInt(e.key));
      }
      // Handle decimal point
      else if (e.key === "." || e.key === ",") {
        e.preventDefault();
        setPressedKey("decimal");
        handlers.handleDecimal?.();
      }
      // Handle operations - check both key and code for better compatibility
      else if (e.key === "+" || (e.shiftKey && e.key === "=")) {
        e.preventDefault();
        setPressedKey("op-plus");
        handlers.handleOperation?.("+");
      } else if (e.key === "-" || e.code === "Minus") {
        e.preventDefault();
        setPressedKey("op-minus");
        handlers.handleOperation?.("-");
      } else if (e.key === "*" || (e.shiftKey && e.key === "8") || e.code === "NumpadMultiply") {
        e.preventDefault();
        setPressedKey("op-multiply");
        handlers.handleOperation?.("*");
      } else if (e.key === "/" || e.code === "Slash" || e.code === "NumpadDivide") {
        e.preventDefault();
        setPressedKey("op-divide");
        handlers.handleOperation?.("/");
      }
      // Handle percentage (%)
      else if (e.key === "%" || (e.shiftKey && e.key === "5")) {
        e.preventDefault();
        setPressedKey("percent");
        handlers.handlePercent?.();
      }
      // Handle equals/Enter
      else if (e.key === "=" || e.key === "Enter" || e.code === "NumpadEnter") {
        e.preventDefault();
        setPressedKey("equals");
        handlers.handleEquals?.();
      }
      // Handle Escape
      else if (e.key === "Escape") {
        e.preventDefault();
        setPressedKey("clear");
        handlers.handleEscape?.();
      }
      // Handle Backspace
      else if (e.key === "Backspace") {
        e.preventDefault();
        setPressedKey("delete");
        handlers.handleDelete?.();
      }
      // Handle Delete key
      else if (e.key === "Delete") {
        e.preventDefault();
        setPressedKey("clear-entry");
        handlers.handleClearEntry?.();
      }
    };

    const handleKeyUp = (e) => {
      // Clear pressed state when key is released
      setPressedKey(null);
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
      if (escTimeoutRef.current) {
        clearTimeout(escTimeoutRef.current);
      }
    };
  }, [onClose]); // Only depend on onClose

  const handleClear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setCurrentExpression("");
  };

  const handleClearHistory = () => {
    setHistory([]);
    setCalculationHistory([]);
  };

  const handleEscape = () => {
    // Clear the timeout if it exists
    if (escTimeoutRef.current) {
      clearTimeout(escTimeoutRef.current);
    }

    // Increment ESC press count
    const currentCount = escPressCountRef.current;
    const newCount = currentCount + 1;
    setEscPressCount(newCount);

    if (newCount === 1) {
      // First ESC: Clear calculator
      handleClear();
      // Reset counter after 1 second
      escTimeoutRef.current = setTimeout(() => {
        setEscPressCount(0);
      }, 1000);
    } else if (newCount === 2) {
      // Second ESC: Close calculator
      setEscPressCount(0);
      if (onClose) {
        onClose();
      }
    }
  };

  const handleNumber = (num) => {
    // Count only digits (excluding decimal point and negative sign)
    const digitCount = display.replace(/[^0-9]/g, "").length;
    
    // Limit to 12 digits
    if (digitCount >= 12) {
      return; // Don't add more digits if already at limit
    }

    let newDisplay;
    if (display === "0" || display === "Error") {
      newDisplay = num.toString();
      setDisplay(newDisplay);
    } else {
      newDisplay = display + num.toString();
      setDisplay(newDisplay);
    }
    // Update current expression if there's an operation in progress
    if (operation && previousValue !== null) {
      const opSymbol = operation === "*" ? "×" : operation === "/" ? "÷" : operation === "+" ? "+" : operation === "-" ? "-" : operation;
      setCurrentExpression(`${formatNumber(previousValue.toString())}${opSymbol}${formatNumber(newDisplay)}`);
    }
  };

  const handleOperation = (op) => {
    if (operation && previousValue !== null) {
      calculate();
    } else {
      setPreviousValue(parseFloat(display));
      setDisplay("0");
    }
    setOperation(op);
    // Update current expression
    const currentVal = parseFloat(display);
      const opSymbol = op === "*" ? "×" : op === "/" ? "÷" : op === "+" ? "+" : op === "-" ? "-" : op;
      setCurrentExpression(`${formatNumber(currentVal.toString())}${opSymbol}`);
  };

  const calculate = () => {
    if (previousValue === null || operation === null) return;

    const current = parseFloat(display);
    let result;

    try {
      switch (operation) {
        case "+":
          result = previousValue + current;
          break;
        case "-":
          result = previousValue - current;
          break;
        case "*":
          result = previousValue * current;
          break;
        case "/":
          if (current === 0) {
            setDisplay("Error");
            setPreviousValue(null);
            setOperation(null);
            return;
          }
          result = previousValue / current;
          break;
        case "%":
          result = previousValue % current;
          break;
        default:
          return;
      }

      const opSymbol = operation === "*" ? "×" : operation === "/" ? "÷" : operation === "+" ? "+" : operation === "-" ? "-" : operation;
      const formattedPrev = formatNumber(previousValue.toString());
      const formattedCurrent = formatNumber(current.toString());
      const formattedResult = formatNumber(result.toString());
      
      // Add to step-wise history
      const historyEntry = `${formattedPrev}${opSymbol}${formattedCurrent}=${formattedResult}`;
      setCalculationHistory((prev) => [...prev, historyEntry].slice(-20)); // Keep last 20 steps
      
      // Also keep old format for bottom history
      const calculation = `${previousValue} ${operation} ${current} = ${result}`;
      setHistory((prev) => [calculation, ...prev].slice(0, 10));
      
      // Limit result to 12 digits
      let resultStr = result.toString();
      const digitCount = resultStr.replace(/[^0-9]/g, "").length;
      if (digitCount > 12) {
        // If result exceeds 12 digits, use scientific notation or round
        if (Math.abs(result) >= 1e12 || Math.abs(result) < 1e-6) {
          resultStr = result.toExponential(6); // Use scientific notation for very large/small numbers
        } else {
          // Round to 12 significant digits
          const precision = 12 - Math.floor(Math.log10(Math.abs(result))) - 1;
          resultStr = result.toFixed(Math.max(0, precision));
        }
      }
      setDisplay(resultStr);
      setCurrentExpression(""); // Clear current expression after calculation
      setPreviousValue(null);
      setOperation(null);
    } catch (error) {
      setDisplay("Error");
      setPreviousValue(null);
      setOperation(null);
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      calculate();
    } else if (currentExpression) {
      // If there's a current expression but no operation, just show the result
      setCurrentExpression("");
    }
  };

  const handleClearEntry = () => {
    setDisplay("0");
  };

  const handleDelete = () => {
    let newDisplay;
    if (display.length > 1) {
      newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);
    } else {
      newDisplay = "0";
      setDisplay(newDisplay);
    }
    // Update current expression if there's an operation in progress
    if (operation && previousValue !== null) {
      const opSymbol = operation === "*" ? "×" : operation === "/" ? "÷" : operation === "+" ? "+" : operation === "-" ? "-" : operation;
      setCurrentExpression(`${formatNumber(previousValue.toString())}${opSymbol}${formatNumber(newDisplay)}`);
    }
  };

  const handleDecimal = () => {
    if (!display.includes(".")) {
      const newDisplay = display + ".";
      setDisplay(newDisplay);
      // Update current expression if there's an operation in progress
      if (operation && previousValue !== null) {
        const opSymbol = operation === "*" ? "×" : operation === "/" ? "÷" : operation === "+" ? "+" : operation === "-" ? "-" : operation;
        setCurrentExpression(`${formatNumber(previousValue.toString())}${opSymbol}${formatNumber(newDisplay)}`);
      }
    }
  };

  const handleMemoryAdd = () => {
    setMemory(memory + parseFloat(display || 0));
  };

  const handleMemorySubtract = () => {
    setMemory(memory - parseFloat(display || 0));
  };

  const handleMemoryRecall = () => {
    setDisplay(memory.toString());
  };

  const handleMemoryClear = () => {
    setMemory(0);
  };

  const handleSquareRoot = () => {
    const value = parseFloat(display);
    if (value < 0) {
      setDisplay("Error");
      return;
    }
    const result = Math.sqrt(value);
    const formattedValue = formatNumber(value.toString());
    
    // Limit result to 12 digits
    let resultStr = result.toString();
    const digitCount = resultStr.replace(/[^0-9]/g, "").length;
    if (digitCount > 12) {
      if (Math.abs(result) >= 1e12 || Math.abs(result) < 1e-6) {
        resultStr = result.toExponential(6);
      } else {
        const precision = 12 - Math.floor(Math.log10(Math.abs(result))) - 1;
        resultStr = result.toFixed(Math.max(0, precision));
      }
    }
    
    const formattedResult = formatNumber(resultStr);
    setDisplay(resultStr);
    setCalculationHistory((prev) => [...prev, `√${formattedValue}=${formattedResult}`].slice(-20));
    setHistory((prev) => [`√${value} = ${result}`, ...prev].slice(0, 10));
  };

  const handleSquare = () => {
    const value = parseFloat(display);
    const result = value * value;
    const formattedValue = formatNumber(value.toString());
    
    // Limit result to 12 digits
    let resultStr = result.toString();
    const digitCount = resultStr.replace(/[^0-9]/g, "").length;
    if (digitCount > 12) {
      if (Math.abs(result) >= 1e12 || Math.abs(result) < 1e-6) {
        resultStr = result.toExponential(6);
      } else {
        const precision = 12 - Math.floor(Math.log10(Math.abs(result))) - 1;
        resultStr = result.toFixed(Math.max(0, precision));
      }
    }
    
    const formattedResult = formatNumber(resultStr);
    setDisplay(resultStr);
    setCalculationHistory((prev) => [...prev, `${formattedValue}²=${formattedResult}`].slice(-20));
    setHistory((prev) => [`${value}² = ${result}`, ...prev].slice(0, 10));
  };

  const handlePercent = () => {
    const value = parseFloat(display);
    const result = value / 100;
    setDisplay(result.toString());
  };

  const handlePlusMinus = () => {
    if (display !== "0" && display !== "Error") {
      setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
    }
  };

  const handleHistoryRollback = (historyEntry) => {
    // Parse history entry to extract the result
    // Format: "1,234×567=700,278" or "√25=5" or "100²=10,000"
    try {
      // Extract the result part after the equals sign
      const parts = historyEntry.split("=");
      if (parts.length >= 2) {
        const resultStr = parts[parts.length - 1].trim();
        // Remove commas and convert to number, then back to string to normalize
        const resultValue = parseFloat(resultStr.replace(/,/g, ""));
        if (!isNaN(resultValue)) {
          setDisplay(resultValue.toString());
          setPreviousValue(null);
          setOperation(null);
          setCurrentExpression("");
        }
      }
    } catch (error) {
      console.error("Error parsing history entry:", error);
    }
  };

  // Update handler refs whenever handlers change
  React.useEffect(() => {
    handlersRef.current = {
      handleNumber,
      handleDecimal,
      handleOperation,
      handleEquals,
      handleEscape,
      handleDelete,
      handleClearEntry,
      handleClear,
      handleClearHistory,
      handlePercent,
    };
  }, [display, previousValue, operation, memory, currentExpression]);

  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <ArrowLeftOutlined 
            style={{ fontSize: 18, marginRight: 12, cursor: "pointer", color: "#0d9489" }}
            onClick={() => {
              if (onClose) onClose();
            }}
            title="Close Calculator"
          />
          <CalculatorOutlined style={{ fontSize: 20, marginRight: 8 }} />
          <Text strong style={{ fontSize: 16 }}>
            Advanced Calculator
          </Text>
        </div>
      </div>

      <div className="calculator-display-container">
        {/* Show current expression if there's an operation in progress */}
        {currentExpression && (
          <div className="calculator-current-expression-display">
            {currentExpression}
          </div>
        )}
        
        {/* Main display - show result prominently if calculation is complete */}
        <div className="calculator-result-display">
          <Input
            id="calc-display"
            className="calculator-display"
            value={formatNumber(display)}
            readOnly
            style={{
              fontSize: 32,
              fontWeight: "bold",
              textAlign: "right",
              height: 70,
              backgroundColor: "#f5f5f5",
              border: "2px solid #0d9489",
            }}
          />
        </div>
        
        {memory !== 0 && (
          <Text type="secondary" style={{ fontSize: 12, textAlign: "right", display: "block", marginTop: 4 }}>
            M: {formatNumber(memory.toString())}
          </Text>
        )}
      </div>

      <div className="calculator-buttons">
        {/* Memory Functions Row */}
        <div className="calc-row">
          <Button onClick={handleMemoryClear} className="calc-btn-memory">
            MC
          </Button>
          <Button onClick={handleMemoryRecall} className="calc-btn-memory">
            MR
          </Button>
          <Button onClick={handleMemorySubtract} className="calc-btn-memory">
            M-
          </Button>
          <Button onClick={handleMemoryAdd} className="calc-btn-memory">
            M+
          </Button>
        </div>

        {/* Function Row */}
        <div className="calc-row">
          <Button onClick={handleSquareRoot} className="calc-btn-function">
            √
          </Button>
          <Button onClick={handleSquare} className="calc-btn-function">
            x²
          </Button>
          <Button 
            onClick={handlePercent} 
            className={`calc-btn-function ${pressedKey === "percent" ? "calc-btn-pressed" : ""}`}
          >
            %
          </Button>
          <Button 
            onClick={handleClear} 
            className={`calc-btn-clear ${pressedKey === "clear" ? "calc-btn-pressed" : ""}`}
          >
            <ClearOutlined />
          </Button>
        </div>

        {/* Clear and Operations Row */}
        <div className="calc-row">
          <Button 
            onClick={handleClearEntry} 
            className={`calc-btn-clear ${pressedKey === "clear-entry" ? "calc-btn-pressed" : ""}`}
          >
            CE
          </Button>
          <Button 
            onClick={handleDelete} 
            className={`calc-btn-clear ${pressedKey === "delete" ? "calc-btn-pressed" : ""}`}
          >
            <DeleteOutlined />
          </Button>
          <Button 
            onClick={() => handleOperation("/")} 
            className={`calc-btn-operation ${pressedKey === "op-divide" ? "calc-btn-pressed" : ""}`}
          >
            ÷
          </Button>
          <Button 
            onClick={() => handleOperation("*")} 
            className={`calc-btn-operation ${pressedKey === "op-multiply" ? "calc-btn-pressed" : ""}`}
          >
            ×
          </Button>
        </div>

        {/* Row with 7-9 and Minus */}
        <div className="calc-row">
          <Button 
            onClick={() => handleNumber(7)} 
            className={`calc-btn-number ${pressedKey === "num-7" ? "calc-btn-pressed" : ""}`}
          >
            7
          </Button>
          <Button 
            onClick={() => handleNumber(8)} 
            className={`calc-btn-number ${pressedKey === "num-8" ? "calc-btn-pressed" : ""}`}
          >
            8
          </Button>
          <Button 
            onClick={() => handleNumber(9)} 
            className={`calc-btn-number ${pressedKey === "num-9" ? "calc-btn-pressed" : ""}`}
          >
            9
          </Button>
          <Button 
            onClick={() => handleOperation("-")} 
            className={`calc-btn-operation calc-btn-tall ${pressedKey === "op-minus" ? "calc-btn-pressed" : ""}`}
          >
            −
          </Button>
        </div>

        {/* Row with 4-6 and Plus */}
        <div className="calc-row">
          <Button 
            onClick={() => handleNumber(4)} 
            className={`calc-btn-number ${pressedKey === "num-4" ? "calc-btn-pressed" : ""}`}
          >
            4
          </Button>
          <Button 
            onClick={() => handleNumber(5)} 
            className={`calc-btn-number ${pressedKey === "num-5" ? "calc-btn-pressed" : ""}`}
          >
            5
          </Button>
          <Button 
            onClick={() => handleNumber(6)} 
            className={`calc-btn-number ${pressedKey === "num-6" ? "calc-btn-pressed" : ""}`}
          >
            6
          </Button>
          <Button 
            onClick={() => handleOperation("+")} 
            className={`calc-btn-operation ${pressedKey === "op-plus" ? "calc-btn-pressed" : ""}`}
          >
            +
          </Button>
        </div>

        {/* Combined grid for last two rows with equals spanning */}
        <div className="calc-rows-combined">
          <Button 
            onClick={() => handleNumber(1)} 
            className={`calc-btn-number ${pressedKey === "num-1" ? "calc-btn-pressed" : ""}`}
          >
            1
          </Button>
          <Button 
            onClick={() => handleNumber(2)} 
            className={`calc-btn-number ${pressedKey === "num-2" ? "calc-btn-pressed" : ""}`}
          >
            2
          </Button>
          <Button 
            onClick={() => handleNumber(3)} 
            className={`calc-btn-number ${pressedKey === "num-3" ? "calc-btn-pressed" : ""}`}
          >
            3
          </Button>
          <Button 
            onClick={handleEquals} 
            className={`calc-btn-equals calc-btn-equals-tall ${pressedKey === "equals" ? "calc-btn-pressed" : ""}`}
          >
            =
          </Button>
          <Button 
            onClick={handlePlusMinus} 
            className={`calc-btn-number ${pressedKey === "plus-minus" ? "calc-btn-pressed" : ""}`}
          >
            ±
          </Button>
          <Button 
            onClick={() => handleNumber(0)} 
            className={`calc-btn-number ${pressedKey === "num-0" ? "calc-btn-pressed" : ""}`}
          >
            0
          </Button>
          <Button 
            onClick={handleDecimal} 
            className={`calc-btn-number ${pressedKey === "decimal" ? "calc-btn-pressed" : ""}`}
          >
            .
          </Button>
        </div>
      </div>

      {/* Calculation History Panel - Bottom */}
      {calculationHistory.length > 0 && (
        <div className="calculator-history-panel-bottom">
          <div className="calculator-history-title">History (Click to rollback)</div>
          {calculationHistory.slice(-10).reverse().map((entry, index) => (
            <div 
              key={index} 
              className="calc-history-entry calc-history-entry-clickable"
              onClick={() => handleHistoryRollback(entry)}
              title="Click to use this result"
            >
              {entry}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Calculator;
