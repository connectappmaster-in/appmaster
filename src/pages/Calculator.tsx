import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return a / b;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const result = calculate(previousValue, parseFloat(display), operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const buttons = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"]
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-md">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Apps
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-right">
              <div className="text-3xl font-mono font-bold text-foreground">{display}</div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {buttons.flat().map((btn) => (
                <Button
                  key={btn}
                  variant={["+", "-", "×", "÷", "="].includes(btn) ? "default" : "outline"}
                  className="h-14 text-lg"
                  onClick={() => {
                    if (btn === "=") handleEquals();
                    else if (["+", "-", "×", "÷"].includes(btn)) handleOperation(btn);
                    else handleNumber(btn);
                  }}
                >
                  {btn}
                </Button>
              ))}
            </div>

            <Button variant="destructive" className="w-full" onClick={handleClear}>
              Clear
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calculator;
