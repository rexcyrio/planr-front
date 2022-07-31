import PropTypes from "prop-types";

export const selfPropTypes = PropTypes.shape({
  _id: PropTypes.string.isRequired,

  name: PropTypes.string.isRequired,
  dueDate: PropTypes.string.isRequired,
  dueTime: PropTypes.string.isRequired,
  durationHours: PropTypes.string.isRequired,
  tag: PropTypes.string.isRequired,
  links: PropTypes.array.isRequired,

  row: PropTypes.number.isRequired,
  col: PropTypes.number.isRequired,
  timeUnits: PropTypes.number.isRequired,

  isCompleted: PropTypes.objectOf(PropTypes.bool).isRequired,
  mondayKey: PropTypes.array.isRequired,
}).isRequired;
