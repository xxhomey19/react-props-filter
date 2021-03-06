import React from 'react';
import R from 'ramda';

import { DOMProps as allDOMProps } from './utils';

const isFn = val => R.equals(R.type(val), 'Function');

const filterProps = ({
  props,
  requiredProps = [],
  mapProps = null,
  options: { DOMProps = false },
}) => {
  let originalProps = R.clone(props);
  const finalProps = {};

  if (mapProps && R.type(mapProps) === 'Function') {
    originalProps = mapProps(props);
  }

  R.forEachObjIndexed((value, key) => {
    if (
      (DOMProps && R.contains(key, allDOMProps)) ||
      R.contains(key, requiredProps)
    ) {
      finalProps[key] = value;
    }
  }, originalProps);

  return finalProps;
};

export default function filter(mapper) {
  const Children = ({ children, ...rest }) =>
    children && isFn(children) && children(rest);

  const reducer = (Component, key, index) => {
    const { requiredProps, mapProps, options } = mapper[key];

    // eslint-disable-next-line react/prop-types
    const NewComponent = ({ children, ...rest }) => (
      <Component {...rest}>
        {props => {
          const propsToPass = filterProps({
            props: rest,
            requiredProps,
            mapProps,
            options: options || {},
          });

          return children(
            index === 0
              ? {
                  allProps: { ...rest },
                  [key]: propsToPass,
                }
              : {
                  ...props,
                  [key]: propsToPass,
                }
          );
        }}
      </Component>
    );

    NewComponent.displayName = 'PropsFilter';

    return NewComponent;
  };

  return R.keys(mapper).reduce(reducer, Children);
}
