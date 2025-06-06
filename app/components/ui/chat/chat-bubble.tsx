import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MessageLoading from "./message-loading";
import { Button, ButtonProps } from "../button";
import { useInView } from "react-intersection-observer";

// ChatBubble
const chatBubbleVariant = cva(
  "flex gap-2 max-w-[80%] items-end relative group",
  {
    variants: {
      variant: {
        received: "self-start",
        sent: "self-end flex-row-reverse",
      },
      layout: {
        default: "",
        ai: "max-w-full w-full items-center",
      },
    },
    defaultVariants: {
      variant: "received",
      layout: "default",
    },
  }
);

interface ChatBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleVariant> {
  messageId?: string;
  isAssistant?: boolean;
  onVisibilityChange?: (messageId: string, visible: boolean) => void;
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  (
    {
      className,
      variant,
      layout,
      children,
      messageId,
      isAssistant,
      onVisibilityChange,
      ...props
    },
    ref
  ) => {
    const { ref: inViewRef } = useInView({
      threshold: 0.5,
      rootMargin: "50px 0px",
      onChange: (inView) => {
        if (isAssistant && messageId && onVisibilityChange) {
          onVisibilityChange(messageId, inView);
        }
      },
    });

    // Merge refs
    const setRefs = React.useCallback(
      (element: HTMLDivElement | null) => {
        // Forward the ref if provided
        if (typeof ref === "function") {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
        inViewRef(element);
      },
      [ref, inViewRef]
    );

    return (
      <div
        className={cn(
          chatBubbleVariant({ variant, layout, className }),
          "relative group"
        )}
        ref={isAssistant ? setRefs : ref}
        {...props}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child) && typeof child.type !== "string"
            ? React.cloneElement(child, {
                variant,
                layout,
              } as React.ComponentProps<typeof child.type>)
            : child
        )}
      </div>
    );
  }
);
ChatBubble.displayName = "ChatBubble";

// ChatBubbleAvatar
interface ChatBubbleAvatarProps {
  src?: string;
  fallback?: string;
  className?: string;
}

const ChatBubbleAvatar: React.FC<ChatBubbleAvatarProps> = ({
  src,
  fallback,
  className,
}) => (
  <Avatar className={className}>
    <AvatarImage src={src} alt="Avatar" />
    <AvatarFallback>{fallback}</AvatarFallback>
  </Avatar>
);

// ChatBubbleMessage
const chatBubbleMessageVariants = cva("p-3", {
  variants: {
    variant: {
      received: `bg-secondary/50 text-secondary-foreground rounded-r-lg rounded-tl-lg `,
      sent: `bg-primary/50 text-primary-foreground rounded-l-lg rounded-tr-lg`,
    },
    layout: {
      default: "",
      ai: "border-t w-full rounded-none bg-transparent",
    },
  },
  defaultVariants: {
    variant: "received",
    layout: "default",
  },
});

interface ChatBubbleMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleMessageVariants> {
  isLoading?: boolean;
  isAssistant?: boolean;
  visibleMessageId?: string;
  messageId?: string;
}

const ChatBubbleMessage = React.forwardRef<
  HTMLDivElement,
  ChatBubbleMessageProps
>(
  (
    {
      className,
      variant,
      layout,
      isLoading = false,
      isAssistant,
      messageId,
      visibleMessageId,
      children,
      ...props
    },
    ref
  ) => (
    <div
      className={`${cn(
        chatBubbleMessageVariants({ variant, layout, className }),
        "break-words text-foreground text-sm max-w-full whitespace-pre-wrap"
      )} ${
        isAssistant && visibleMessageId === messageId
          ? "outline-2 outline-amber-500/60"
          : ""
      }`}
      ref={ref}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <MessageLoading />
        </div>
      ) : (
        children
      )}
    </div>
  )
);
ChatBubbleMessage.displayName = "ChatBubbleMessage";

// ChatBubbleTimestamp
interface ChatBubbleTimestampProps
  extends React.HTMLAttributes<HTMLDivElement> {
  timestamp: string;
}

const ChatBubbleTimestamp: React.FC<ChatBubbleTimestampProps> = ({
  timestamp,
  className,
  ...props
}) => (
  <div className={cn("text-xs mt-2 text-right", className)} {...props}>
    {timestamp}
  </div>
);

// ChatBubbleAction
type ChatBubbleActionProps = ButtonProps & {
  icon: React.ReactNode;
};

const ChatBubbleAction: React.FC<ChatBubbleActionProps> = ({
  icon,
  onClick,
  className,
  variant = "ghost",
  size = "icon",
  ...props
}) => (
  <Button
    variant={variant}
    size={size}
    className={className}
    onClick={onClick}
    {...props}
  >
    {icon}
  </Button>
);

interface ChatBubbleActionWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received";
  className?: string;
}

const ChatBubbleActionWrapper = React.forwardRef<
  HTMLDivElement,
  ChatBubbleActionWrapperProps
>(({ variant, className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200",
      variant === "sent"
        ? "-left-1 -translate-x-full flex-row-reverse"
        : "-right-1 translate-x-full",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
ChatBubbleActionWrapper.displayName = "ChatBubbleActionWrapper";

export {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  chatBubbleVariant,
  chatBubbleMessageVariants,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
};
