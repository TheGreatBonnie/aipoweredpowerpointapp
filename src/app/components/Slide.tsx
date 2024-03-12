"use client";

import { useMakeCopilotActionable } from "@copilotkit/react-core";

// Define an interface for the model of a slide, specifying the expected structure of a slide object.
export interface SlideModel {
  title: string;
  content: string;
  backgroundImageDescription: string;
  spokenNarration: string;
}

// Define an interface for the properties of a component or function that manages slides.
export interface SlideProps {
  slide: SlideModel;
  partialUpdateSlide: (partialSlide: Partial<SlideModel>) => void;
}

// Define a functional component named Slide that accepts props of type SlideProps.
export const Slide = (props: SlideProps) => {
    // Define a constant for the height of the area reserved for speaker notes.
    const heightOfSpeakerNotes = 150;
  
    // Construct a URL for the background image using the description from slide properties, dynamically fetching an image from Unsplash.
    const backgroundImage =
      'url("https://source.unsplash.com/featured/?' +
      encodeURIComponent(props.slide.backgroundImageDescription) +
      '")';

    

    useMakeCopilotActionable({
        // Defines the action name. This is a unique identifier for the action within the application.
        name: "updateSlide",
        // Describes what the action does. In this case, it updates the current slide.
        description: "Update the current slide.",
        // Details the arguments that the action accepts. Each argument has a name, type, description, and a flag indicating if it's required.
        argumentAnnotations: [
        {
            name: "title", // The argument name.
            type: "string", // The data type of the argument.
            description: "The title of the slide. Should be a few words long.", // Description of the argument.
            required: true, // Indicates that this argument must be provided for the action to execute.
        },
        {
            name: "content",
            type: "string",
            description: "The content of the slide. Should generally consists of a few bullet points.",
            required: true,
        },
        {
            name: "backgroundImageDescription",
            type: "string",
            description: "What to display in the background of the slide. For example, 'dog', 'house', etc.",
            required: true,
        },
        {
            name: "spokenNarration",
            type: "string",
            description: "The spoken narration for the slide. This is what the user will hear when the slide is shown.",
            required: true,
        },
        ],
        // The implementation of the action. This is a function that will be called when the action is executed.
        implementation: async (title, content, backgroundImageDescription, spokenNarration) => {
        // Calls a function passed in through props to partially update the slide with new values for the specified properties.
        props.partialUpdateSlide({
            title,
            content,
            backgroundImageDescription,
            spokenNarration,
        });
        },
    }, [props.partialUpdateSlide]); // Dependencies array for the custom hook or function. This ensures that the action is re-initialized only when `props.partialUpdateSlide` changes.
    
  
    // Return JSX for the slide component.
    return (
      <>
        {/* Slide content container with dynamic height calculation to account for speaker notes area. */}
        <div 
          className="w-full relative bg-slate-200"
          style={{
            height: `calc(100vh - ${heightOfSpeakerNotes}px)`, // Calculate height to leave space for speaker notes.
          }}
        >
          {/* Container for the slide title with centered alignment and styling. */}
          <div 
            className="h-1/5 flex items-center justify-center text-5xl text-white text-center z-10"
          >
            {/* Textarea for slide title input, allowing dynamic updates. */}
            <textarea
              className="text-2xl bg-transparent text-black p-4 text-center font-bold uppercase italic line-clamp-2 resize-none flex items-center"
              style={{
                border: "none",
                outline: "none",
              }}
              value={props.slide.title}
              placeholder="Title"
              onChange={(e) => {
                props.partialUpdateSlide({ title: e.target.value });
              }}
            />
          </div>
  
          {/* Container for the slide content with background image. */}
          <div className="h-4/5 flex"
            style={{
              backgroundImage,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Textarea for slide content input, allowing dynamic updates and styled for readability. */}
            <textarea
              className="w-full text-3xl text-black font-medium p-10 resize-none bg-red mx-40 my-8 rounded-xl text-center"
              style={{
                lineHeight: "1.5",
              }}
              value={props.slide.content}
              placeholder="Body"
              onChange={(e) => {
                props.partialUpdateSlide({ content: e.target.value });
              }}
            />
          </div>
        </div>
  
        {/* Textarea for entering spoken narration with specified height and styling for consistency. */}
        <textarea
          className=" w-9/12 h-full bg-transparent text-5xl p-10 resize-none bg-gray-500 pr-36"
          style={{
            height: `${heightOfSpeakerNotes}px`,
            background: "none",
            border: "none",
            outline: "none",
            fontFamily: "inherit",
            fontSize: "inherit",
            lineHeight: "inherit",
          }}
          value={props.slide.spokenNarration}
          onChange={(e) => {
            props.partialUpdateSlide({ spokenNarration: e.target.value });
          }}
        />
      </>
    );
  };
  