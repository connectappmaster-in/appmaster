import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

const TimerApp = () => {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(minutes * 60 + seconds);
  };

  const setTimer = () => {
    setTimeLeft(minutes * 60 + seconds);
    setIsActive(false);
  };

  const displayMinutes = Math.floor(timeLeft / 60);
  const displaySeconds = timeLeft % 60;

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
            <CardTitle>Timer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-foreground">
                {String(displayMinutes).padStart(2, "0")}:{String(displaySeconds).padStart(2, "0")}
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                size="lg"
                onClick={toggleTimer}
                variant={isActive ? "secondary" : "default"}
              >
                {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                {isActive ? "Pause" : "Start"}
              </Button>
              <Button size="lg" variant="outline" onClick={resetTimer}>
                <RotateCcw className="mr-2 h-5 w-5" />
                Reset
              </Button>
            </div>

            <div className="pt-4 border-t space-y-3">
              <p className="text-sm text-muted-foreground">Set Timer</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Minutes"
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  min={0}
                />
                <Input
                  type="number"
                  placeholder="Seconds"
                  value={seconds}
                  onChange={(e) => setSeconds(Number(e.target.value))}
                  min={0}
                  max={59}
                />
              </div>
              <Button className="w-full" onClick={setTimer}>
                Set Time
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimerApp;
