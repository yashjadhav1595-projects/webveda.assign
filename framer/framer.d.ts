/**
 * Ambient type declarations for Framer module
 * Provides type checking in local IDEs for components using addPropertyControls and ControlType.
 */

declare module 'framer' {
  import * as React from 'react';

  export enum ControlType {
    Boolean = 'Boolean',
    Number = 'Number',
    String = 'String',
    Enum = 'Enum',
    SegmentedEnum = 'SegmentedEnum',
    Color = 'Color',
    Image = 'Image',
    File = 'File',
    ComponentInstance = 'ComponentInstance',
    Array = 'Array',
    Object = 'Object',
    ResponsiveImage = 'ResponsiveImage',
    Date = 'Date',
    Link = 'Link',
    Transition = 'Transition',
    EventHandler = 'EventHandler',
  }

  export interface PropertyControlDescription {
    type: ControlType | string;
    title?: string;
    description?: string;
    defaultValue?: any;
    options?: any[];
    optionTitles?: string[];
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    displayStepper?: boolean;
    hidden?: (props: any) => boolean;
  }

  export type PropertyControls<P = any> = {
    [K in keyof P]?: PropertyControlDescription;
  };

  export function addPropertyControls<P>(
    component: React.ComponentType<P>,
    controls: PropertyControls<P>
  ): void;

  export const Frame: React.ComponentType<any>;
  export const Stack: React.ComponentType<any>;
}
