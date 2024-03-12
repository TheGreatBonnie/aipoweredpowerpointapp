"use client";

import { useCopilotContext } from "@copilotkit/react-core";
import { CopilotTask } from "@copilotkit/react-core";
import {
  useMakeCopilotActionable,
  useMakeCopilotReadable
} from "@copilotkit/react-core";

import { useCallback, useMemo, useState } from "react";
import {
  BackwardIcon,
  ForwardIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { SlideModel, Slide } from "./Slide";

export const ActionButton = ({
  disabled, onClick, className, children,
}: {
  disabled: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <button
      disabled={disabled}
      className={`bg-blue-500 text-white font-bold py-2 px-4 rounded
      ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}
      ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};


// Define the Presentation component as a functional component.
export const Presentation = () => {
    // Initialize state for slides with a default first slide and a state to track the current slide index.
    const [slides, setSlides] = useState<SlideModel[]>([
      {
        title: `Welcome to our presentation!`, // Title of the first slide.
        content: 'This is the first slide.', // Content of the first slide.
        backgroundImageDescription: "hello", // Description for background image retrieval.
        spokenNarration: "This is the first slide. Welcome to our presentation!", // Spoken narration text for the first slide.
      },
    ]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0); // Current slide index, starting at 0.
  
    // Use useMemo to memoize the current slide object to avoid unnecessary recalculations.
    const currentSlide = useMemo(() => slides[currentSlideIndex], [slides, currentSlideIndex]);

    useMakeCopilotReadable("These are all the slides: " + JSON.stringify(slides));
    useMakeCopilotReadable(
        "This is the current slide: " + JSON.stringify(currentSlide)
    );

    useMakeCopilotActionable(
        {
          // Defines the action's metadata.
          name: "appendSlide", // Action identifier.
          description: "Add a slide after all the existing slides. Call this function multiple times to add multiple slides.",
          // Specifies the arguments that the action takes, including their types, descriptions, and if they are required.
          argumentAnnotations: [
            {
              name: "title", // The title of the new slide.
              type: "string",
              description: "The title of the slide. Should be a few words long.",
              required: true,
            },
            {
              name: "content", // The main content or body of the new slide.
              type: "string",
              description: "The content of the slide. Should generally consist of a few bullet points.",
              required: true,
            },
            {
              name: "backgroundImageDescription", // Description for fetching or generating the background image of the new slide.
              type: "string",
              description: "What to display in the background of the slide. For example, 'dog', 'house', etc.",
              required: true,
            },
            {
              name: "spokenNarration", // Narration text that will be read aloud during the presentation of the slide.
              type: "string",
              description: "The text to read while presenting the slide. Should be distinct from the slide's content, and can include additional context, references, etc. Will be read aloud as-is. Should be a few sentences long, clear, and smooth to read.",
              required: true,
            },
          ],
          // The function to execute when the action is triggered. It creates a new slide with the provided details and appends it to the existing slides array.
          implementation: async (title, content, backgroundImageDescription, spokenNarration) => {
            const newSlide: SlideModel = { // Constructs the new slide object.
              title,
              content,
              backgroundImageDescription,
              spokenNarration,
            };
      
            // Updates the slides state by appending the new slide to the end of the current slides array.
            setSlides((slides) => [...slides, newSlide]);
          },
        },
        [setSlides] // Dependency array for the hook. This action is dependent on the `setSlides` function, ensuring it reinitializes if `setSlides` changes.
    );

    const context = useCopilotContext();
    const generateSlideTask = new CopilotTask({
        instructions: "Make the next slide related to the overall topic of the presentation. It will be inserted after the current slide. Do NOT carry any research",
    });
    const [generateSlideTaskRunning, setGenerateSlideTaskRunning] = useState(false);
  
    // Define a function to update the current slide. This function uses useCallback to memoize itself to prevent unnecessary re-creations.
    const updateCurrentSlide = useCallback(
      (partialSlide: Partial<SlideModel>) => {
        // Update the slides state by creating a new array with the updated current slide.
        setSlides((slides) => [
          ...slides.slice(0, currentSlideIndex), // Copy all slides before the current one.
          { ...slides[currentSlideIndex], ...partialSlide }, // Merge the current slide with the updates.
          ...slides.slice(currentSlideIndex + 1), // Copy all slides after the current one.
        ]);
      },
      [currentSlideIndex, setSlides] // Dependencies for useCallback.
    );
  
    // The JSX structure for the Presentation component.
    return (
        <div className="relative">
        {/* Renders the current slide using a Slide component with props for the slide data and a method to update it. */}
        <Slide slide={currentSlide} partialUpdateSlide={updateCurrentSlide} />
    
        {/* Container for action buttons positioned at the top left corner of the relative parent */}
        <div className="absolute top-0 left-0 mt-6 ml-4 z-30">
            {/* ActionButton to add a new slide. It is disabled when a generateSlideTask is running to prevent concurrent modifications. */}
            <ActionButton
            disabled={generateSlideTaskRunning}
            onClick={() => {
                const newSlide: SlideModel = {
                title: "Title",
                content: "Body",
                backgroundImageDescription: "random",
                spokenNarration: "The speaker's notes for this slide.",
                };
                // Inserts the new slide immediately after the current slide and updates the slide index to point to the new slide.
                setSlides((slides) => [
                ...slides.slice(0, currentSlideIndex + 1),
                newSlide,
                ...slides.slice(currentSlideIndex + 1),
                ]);
                setCurrentSlideIndex((i) => i + 1);
            }}
            className="rounded-r-none"
            >
            <PlusIcon className="h-6 w-6" />
            </ActionButton>
    
            {/* ActionButton to generate a new slide based on the current context, also disabled during task running. */}
            <ActionButton
            disabled={generateSlideTaskRunning}
            onClick={async () => { 
                setGenerateSlideTaskRunning(true); // Indicates the task is starting.
                await generateSlideTask.run(context); // Executes the task with the current context.
                setGenerateSlideTaskRunning(false); // Resets the flag when the task is complete.
            }}
            className="rounded-l-none ml-[1px]"
            >
            <SparklesIcon className="h-6 w-6" />
            </ActionButton>
        </div>
    
        {/* Container for action buttons at the top right, including deleting the current slide and potentially other actions. */}
        <div className="absolute top-0 right-0 mt-6 mr-24">
            {/* ActionButton for deleting the current slide, disabled if a task is running or only one slide remains. */}
            <ActionButton
            disabled={generateSlideTaskRunning || slides.length === 1}
            onClick={() => {
                console.log("delete slide");
                // Removes the current slide and resets the index to the beginning as a simple handling strategy.
                setSlides((slides) => [
                ...slides.slice(0, currentSlideIndex),
                ...slides.slice(currentSlideIndex + 1),
                ]);
                setCurrentSlideIndex((i) => 0);
            }}
            className="ml-5 rounded-r-none"
            >
            <TrashIcon className="h-6 w-6" />
            </ActionButton>
        </div>
    
        {/* Display showing the current slide index and the total number of slides. */}
        <div
            className="absolute bottom-0 right-0 mb-20 mx-24 text-xl"
            style={{
            textShadow: "1px 1px 0 #ddd, -1px -1px 0 #ddd, 1px -1px 0 #ddd, -1px 1px 0 #ddd",
            }}
        >
            Slide {currentSlideIndex + 1} of {slides.length}
        </div>
    
        {/* Navigation buttons to move between slides, disabled based on the slide index or if a task is running. */}
        <div className="absolute bottom-0 right-0 mb-6 mx-24">
            {/* Button to move to the previous slide, disabled if on the first slide or a task is running. */}
            <ActionButton
            className="rounded-r-none"
            disabled={generateSlideTaskRunning || currentSlideIndex === 0}
            onClick={() => {
                setCurrentSlideIndex((i) => i - 1);
            }}
            >
            <BackwardIcon className="h-6 w-6" />
            </ActionButton>
            {/* Button to move to the next slide, disabled if on the last slide or a task is running. */}
            <ActionButton
            className="mr-[1px] rounded-l-none"
            disabled={generateSlideTaskRunning || currentSlideIndex + 1 === slides.length}
            onClick={async () => {
                setCurrentSlideIndex((i) => i + 1);
            }}
            >
            <ForwardIcon className="h-6 w-6" />
            </ActionButton>
        </div>
        </div>
    );
  
  };
  
