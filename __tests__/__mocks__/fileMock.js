const React = require("react");
const MockComponent = React.forwardRef((props, ref) => null);
MockComponent.default = MockComponent;
module.exports = MockComponent;
