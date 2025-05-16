"use client";

import { useState, useRef, MouseEvent, useEffect } from "react";
import { Button } from "./ui/button";
import { Minus } from "lucide-react";
import { NotepadMenuBar } from "./FloatingWindowMenuBar";
import { useCurrentNote } from "./providers/CurrentNoteProvider";

type FloatingWindowProps = {
  children: React.ReactNode;
  initialWidth?: number;
  initialHeight?: number;
  isNotepadOpen: boolean;
  setIsNotepadOpen: (isOpen: boolean) => void;
};

const FloatingWindow = ({
  children,
  initialWidth = 300,
  initialHeight = 200,
  isNotepadOpen,
  setIsNotepadOpen,
}: FloatingWindowProps) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const windowRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const initialSize = useRef({ width: 0, height: 0 });
  const { currentNote, saveStatus } = useCurrentNote();

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y,
      });
    } else if (isResizing) {
      setSize({
        width: Math.max(150, e.clientX - position.x),
        height: Math.max(100, e.clientY - position.y),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
      if (e.buttons === 0) {
        setIsDragging(false);
        setIsResizing(false);
        return;
      }

      if (isDragging) {
        const newX = e.clientX - dragStartPos.current.x;
        const newY = e.clientY - dragStartPos.current.y;

        // Constrain to window bounds
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStartPos.current.x;
        const deltaY = e.clientY - resizeStartPos.current.y;

        const newWidth = Math.max(200, initialSize.current.width + deltaX);
        const newHeight = Math.max(150, initialSize.current.height + deltaY);

        // Constrain to window bounds and minimum size
        const maxWidth = window.innerWidth - position.x;
        const maxHeight = window.innerHeight - position.y;

        // Store the constrained values
        const constrainedWidth = Math.min(newWidth, maxWidth);
        const constrainedHeight = Math.min(newHeight, maxHeight);

        setSize({
          width: constrainedWidth,
          height: constrainedHeight,
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    // Add global event listeners for both dragging and resizing
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      // Prevent text selection while dragging/resizing
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.body.style.userSelect = "";
    };
  }, [isDragging, isResizing, position.x, position.y, size.width, size.height]);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.closest(".drag-handle")) {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  // Handle resizing
  const handleResizeMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    initialSize.current = { width: size.width, height: size.height };
  };

  {
    if (isNotepadOpen) {
      return (
        <div
          ref={windowRef}
          className="absolute bg-card border border-neutral-500/20 rounded shadow-lg overflow-hidden"
          style={{
            left: position.x,
            top: position.y,
            width: size.width,
            height: size.height,
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          //   onMouseLeave={handleMouseUp}
        >
          <div
            className="drag-handle p-2 cursor-move border-b border-neutral-700/20 select-none"
            onMouseDown={handleMouseDown}
          >
            <div className="px-2 flex items-center justify-between">
              <div className="relative flex space-x-2">
                <div className="items-center">
                  <div className="flex items-center">
                    {currentNote && (
                      <div
                        className={`w-3 h-3 rounded-full mr-4 ${currentNote.color}`}
                      />
                    )}
                    <div className="flex flex-col">
                      <p className="">{currentNote?.name ?? "Unnamed Note"}</p>
                      <p className="italic text-xs text-muted-foreground">
                        {saveStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="flex items-center space-x-2">
                <NotepadMenuBar />
              </div> */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsNotepadOpen(false)}
                className="cursor-pointer"
              >
                <Minus className="h-4 w-4 cursor-pointer" />
              </Button>
            </div>
            <NotepadMenuBar />
          </div>
          <div className="p-2.5 h-[calc(100%-37px)]">{children}</div>

          <div
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize"
            onMouseDown={handleResizeMouseDown}
            style={{
              background:
                "linear-gradient(135deg, transparent 50%, rgb(75 85 99) 50%)",
            }}
          />
        </div>
      );
    }
  }
};

export default FloatingWindow;
