'use client';

import { useState, useEffect } from "react";

interface TypewriterTextProps {
    text: string;
    speed?: number;
    className?: string;
    cursorClassName?: string;
    onComplete?: () => void;
}

export default function TypewriterText({
    text,
    speed = 40,
    className = "",
    cursorClassName = "w-1.5 h-6 sm:h-7 lg:h-8 bg-yellow-400 ml-1.5",
    onComplete,
}: TypewriterTextProps) {
    const [typedText, setTypedText] = useState("");
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        let index = 0;
        setTypedText("");
        setIsTyping(true);

        const timer = setInterval(() => {
            if (index < text.length) {
                setTypedText(text.substring(0, index + 1));
                index++;
            } else {
                setIsTyping(false);
                if (onComplete) onComplete();
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed, onComplete]);

    return (
        <span className={className}>
            <span>{typedText}</span>
            {isTyping && (
                <span className={`inline-block animate-pulse align-middle ${cursorClassName}`} />
            )}
        </span>
    );
}