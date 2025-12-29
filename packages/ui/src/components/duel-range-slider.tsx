'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@swapparel/shad-ui/lib/utils';

interface DualRangeSliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
    labelPosition?: 'top' | 'bottom';
    label?: (value: number | string | undefined) => React.ReactNode;
    active?: boolean; // ← new prop
}


const DualRangeSlider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  DualRangeSliderProps
>(({ className, label, labelPosition = 'top', active = true, ...props }, ref) => {
    const min = props.min ?? 0;
    const max = props.max ?? 100;

    const values = Array.isArray(props.value) ? props.value : [min, max];

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          !active && 'opacity-50 pointer-events-none', // dim & disable interaction
          className
        )}
        {...props}
      >

      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
              <SliderPrimitive.Range className="absolute h-full bg-primary" />
          </SliderPrimitive.Track>

          {values.map((value, index) => {
              const isMaxThumb = index === values.length - 1;
              const isAtMax = value === max;
              const displayValue = isMaxThumb && isAtMax ? `${value}+` : value;

              return (
                <SliderPrimitive.Thumb
                  key={index}
                  className="relative block h-4 w-4 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                    {label && (
                      <span
                        className={cn(
                          'absolute flex w-full justify-center',
                          labelPosition === 'top' && '-top-7',
                          labelPosition === 'bottom' && 'top-4'
                        )}
                      >
                {label(displayValue)}
              </span>
                    )}
                </SliderPrimitive.Thumb>
              );
          })}
      </SliderPrimitive.Root>
    );
});

DualRangeSlider.displayName = 'DualRangeSlider';

export { DualRangeSlider };
