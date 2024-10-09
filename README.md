# Next-Simple-Select

[![NPM](https://img.shields.io/npm/v/next-react-select.svg)](https://www.npmjs.com/package/next-react-select)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/abubakar-sarwar/next-simple-select/blob/main/LICENCE)

Next-Simple-Select helps you develop powerful select components that _just work_ out of the box, without stopping you from customising the parts that are important to you.

## Features

- **Flexible Data Handling**: Customizable functions allow for a flexible approach to managing options.
- **Customizable Styles**: Control styles using CSS classes and CSS variables for a tailored look.
- **Component Injection**: Inject custom components for full control over the UI behavior.
- **Controllable State Management**: Easily manage state through props for a modular architecture.
- **Virtual List Support**: Efficiently handle large datasets with optional virtual scrolling for improved performance.
- **Accessibility Focused**: Built-in accessibility features to enhance usability for all users.
- **Clearable Selection**: Users can easily clear their selection when needed.

## Long List Optimization

### Purpose of the Package

This package is designed to enhance the performance of applications dealing with large datasets, particularly when rendering long lists. As web applications grow in complexity and the amount of data they handle increases, performance optimization becomes critical. This package aims to provide developers with tools to efficiently manage and render large lists without compromising user experience.

### Long List Optimization

One of the standout features of this package is the implementation of `useVirtualList`, which optimizes the rendering of extensive datasets. By using virtualization, the package only renders the items currently visible in the viewport, significantly improving performance and reducing memory usage.

#### Benefits of Using `useVirtualList`:

- **Improved Performance**: Renders only the items visible in the user’s viewport, which leads to faster load times and smoother interactions.
- **Reduced Memory Footprint**: Minimizes the number of DOM nodes created, conserving memory resources for large datasets.
- **Seamless User Experience**: Provides a responsive interface even with substantial amounts of data, making scrolling and interaction fluid.

> **Note**: This feature is disabled by default. To enable virtual scrolling, set the `useVirtualList` prop to `true` in your component.

# Installation and usage

The easiest way to use next-simple-select is to install it from npm or yarn and build it into your app with Webpack.

```bash
npm i next-simple-select
```

Then use it in your app:

```js
"use client";
import { useState } from "react";
import SimpleSelect from "next-simple-select";

const options = [
  { value: "test1", label: "Test 1" },
  { value: "test2", label: "Test 2" },
  { value: "test3", label: "Test 3" },
];

export default function App() {
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div className="App">
      <SimpleSelect
        value={selectedOption}
        onChange={setSelectedOption}
        options={options}
      />
    </div>
  );
}
```

## Props

Common props you may want to specify include:

- `className` - apply a className to the control.
- `isDisabled` - disable the control.
- `name` - generate an HTML input with this name, containing the current value.
- `inputId` - generate an HTML input with this id, containing the current value.
- `onChange` - subscribe to change events.
- `options` - specify the options the user can select from.
- `placeholder` - change the text displayed when no option is selected.
- `value` - control the current value.
- `isClearable` - allow the user to clear the selected value.
- `showSeparator` - display a separator between options.
- `openMenuOnFocus` - automatically open the dropdown menu when the input is focused.
- `useVirtualList` - enable virtual scrolling for performance with large lists.
- `components` - customize components within the select, including:
  - `IndicatorDropdown` - custom indicator for the dropdown.
  - `IndicatorSeparator` - custom separator indicator.
  - `IndicatorClearable` - custom clear indicator.
  - `Option` - render a custom option component.

## Customizations

You can customize the behavior and appearance of the select component through **component injection**. This feature allows you to replace or enhance specific parts of the select component. Below are the available components you can inject:

### Available Components

- **Option**: Replace the default option rendering with your custom component to enhance the option display also changes the selected value component.
- **IndicatorDropdown**: Customize the dropdown indicator component.
- **IndicatorSeparator**: Modify the separator between the select control and the dropdown indicator.
- **IndicatorClearable**: Customize the clearable indicator that appears when the select has a value.

### Usage

To use component injection, you can pass the desired components as props to the select component. Here’s an example:

```js
"use client";
import Image from "next/image";
import { FiMinus, FiMoreVertical, FiPlus } from "react-icons/fi";
import SimpleSelect from "next-simple-select";

const options = [
  { value: "test1", label: "Test 1", flag: "https://flagcdn.com/w320/pk.png" },
  { value: "test2", label: "Test 2", flag: "https://flagcdn.com/w320/ca.png" },
  { value: "test3", label: "Test 3", flag: "https://flagcdn.com/w320/us.png" },
];

export default function App() {
  return (
    <div className="App">
      <SimpleSelect
        name="country"
        inputId="country"
        showSeparator
        isClearable
        useVirtualList
        options={options}
        components={{
          IndicatorClearable: <FiMinus />,
          IndicatorDropdown: <FiPlus />,
          IndicatorSeparator: (
            <div className="flex items-center">
              <FiMoreVertical />
            </div>
          ),
          Option: (option) => {
            return (
              <div className="flex items-center gap-3">
                <Image
                  src={option.flag}
                  alt="flag"
                  width={30}
                  height={15}
                  className="object-contain aspect-video"
                />
                {option.label}
              </div>
            );
          },
        }}
      />
    </div>
  );
}
```

![Sample Component Injection Image](https://github.com/abubakar-sarwar/next-simple-select/blob/main/simpleSelectCustom.png)

You can customize the styles of the component using CSS classes as well as CSS variables. Below are the available CSS variables you can set in your styles:

```css
:root {
  --simpleSelect-border-radius: 4px;
  --simpleSelect-border: rgba(204, 204, 204, 1);
  --simpleSelect-border-focus: rgba(38, 132, 255, 1);
  --simpleSelect-input-color: rgba(0, 0, 0, 1);
  --simpleSelect-placeholder-color: rgba(128, 128, 128, 1);
  --simpleSelect-separator-color: rgba(204, 204, 204, 1);
  --simpleSelect-indicator-color: rgba(204, 204, 204, 1);
  --simpleSelect-indicator-color-active: rgba(102, 102, 102, 1);
  --simpleSelect-dropdown-bg: rgba(255, 255, 255, 1);
  --simpleSelect-option-focus-bg: rgb(222, 235, 255, 1);
  --simpleSelect-option-focus: rgba(0, 0, 0, 1);
  --simpleSelect-option-active-bg: rgba(49, 129, 250, 1);
  --simpleSelect-option-active: rgba(255, 255, 255, 1);
  --simpleSelect-no-option: rgba(153, 153, 153, 1);
  --simpleSelect-size-indicators: 20px;
}
```

## TypeScript

This package is fully written in TypeScript, providing strong type safety and developer experience. If you're working in a TypeScript environment, everything should work seamlessly.

The build process uses `tsup` to generate both CommonJS and ES modules, while also generating type declarations (`.d.ts`). Here's a look at the dependencies:

```json
"dependencies": {
  "react": "^18.3.1",
  "react-window": "^1.8.10"
}
```

# Thanks

Thank you for choosing this package! I hope it makes your development easier and more enjoyable. If you'd like to stay connected or follow my future projects, feel free to follow me on [GitHub](https://github.com/abubakar-sarwar) or [LinkedIn](https://www.linkedin.com/in/muhammad-abubakar-b238a5298).

Looking forward to your feedback and contributions!

## License

MIT Licensed. Copyright (c) M. Abu Bakar 2024.
