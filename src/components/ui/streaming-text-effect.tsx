"use client";
import { useEffect, useState, useRef } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const StreamingTextEffect = ({
    text,
    className,
    filter = true,
    duration = 0.3,
    isStreaming = false,
}: {
    text: string;
    className?: string;
    filter?: boolean;
    duration?: number;
    isStreaming?: boolean;
}) => {
    const [scope, animate] = useAnimate();
    const [processedContent, setProcessedContent] = useState<JSX.Element[]>([]);
    const [animatedWordCount, setAnimatedWordCount] = useState(0);
    const previousTextRef = useRef("");
    const isFirstRender = useRef(true);
    const totalWordsRef = useRef(0);

    // Process text into structured content while preserving formatting
    const processText = (text: string) => {
        const lines = text.split('\n');
        const elements: JSX.Element[] = [];
        let wordIndex = 0;

        lines.forEach((line, lineIndex) => {
            if (line.trim() === '') {
                // Empty line - add line break
                elements.push(<br key={`br-${lineIndex}`} />);
            } else {
                // Process words in this line
                const words = line.split(' ').filter(word => word.length > 0);
                const lineElements: JSX.Element[] = [];

                words.forEach((word, wordIndexInLine) => {
                    const shouldBeVisible = !isStreaming || wordIndex < animatedWordCount;

                    lineElements.push(
                        <motion.span
                            key={`word-${wordIndex}`}
                            className="inline-block"
                            initial={{
                                opacity: shouldBeVisible ? 1 : 0,
                                filter: shouldBeVisible ? "none" : (filter ? "blur(10px)" : "none")
                            }}
                            style={{
                                opacity: shouldBeVisible ? 1 : 0,
                                filter: shouldBeVisible ? "none" : (filter ? "blur(10px)" : "none"),
                            }}
                        >
                            {word}
                            {wordIndexInLine < words.length - 1 ? ' ' : ''}
                        </motion.span>
                    );
                    wordIndex++;
                });

                // Wrap the line in a div to preserve line structure
                elements.push(
                    <div key={`line-${lineIndex}`} className="block">
                        {lineElements}
                    </div>
                );
            }
        });

        totalWordsRef.current = wordIndex;
        return elements;
    };

    useEffect(() => {
        if (text !== previousTextRef.current) {
            const newContent = processText(text);
            setProcessedContent(newContent);

            // Count total words for animation tracking
            const totalWords = text.split(/\s+/).filter(word => word.length > 0).length;
            const previousWords = previousTextRef.current.split(/\s+/).filter(word => word.length > 0).length;

            if (isStreaming) {
                // For streaming: only animate new words
                if (totalWords > previousWords) {
                    const newWordCount = totalWords - previousWords;
                    const startIndex = previousWords;

                    setTimeout(() => {
                        if (scope.current) {
                            const allSpans = scope.current.querySelectorAll('span');
                            const newSpans = Array.from(allSpans).slice(startIndex, startIndex + newWordCount);

                            if (newSpans.length > 0) {
                                animate(
                                    newSpans,
                                    {
                                        opacity: 1,
                                        filter: filter ? "blur(0px)" : "none",
                                    },
                                    {
                                        duration: duration,
                                        delay: stagger(0.1),
                                    }
                                );
                            }
                            setAnimatedWordCount(totalWords);
                        }
                    }, 50);
                } else if (isFirstRender.current) {
                    // First render with existing text - animate all words
                    setTimeout(() => {
                        if (scope.current) {
                            animate(
                                "span",
                                {
                                    opacity: 1,
                                    filter: filter ? "blur(0px)" : "none",
                                },
                                {
                                    duration: duration,
                                    delay: stagger(0.08),
                                }
                            );
                            setAnimatedWordCount(totalWords);
                        }
                    }, 50);
                }
            } else {
                // For completed agents: show all text immediately
                setTimeout(() => {
                    if (scope.current) {
                        animate(
                            "span",
                            {
                                opacity: 1,
                                filter: "none",
                            },
                            {
                                duration: 0.1,
                                delay: stagger(0.02),
                            }
                        );
                        setAnimatedWordCount(totalWords);
                    }
                }, 10);
            }

            previousTextRef.current = text;
            isFirstRender.current = false;
        }
    }, [text, animate, filter, duration, isStreaming]);

    return (
        <div className={cn("font-mono text-sm leading-relaxed", className)}>
            <motion.div ref={scope} className="whitespace-pre-wrap">
                {processedContent}
                {isStreaming && (
                    <motion.span
                        className="inline-block w-1 h-4 bg-blue-500 ml-1"
                        animate={{
                            opacity: [1, 0.2, 1],
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                )}
            </motion.div>
        </div>
    );
}; 