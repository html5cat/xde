let React = require('react');

let _ = require('lodash-node');
let OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');
let Tooltip = require('react-bootstrap/lib/Tooltip');

class OverlayTooltip extends React.Component {

  render() {

    let tooltip;
    if (_.isString(this.props.tooltip)) {
      tooltip = (<Tooltip>{this.props.tooltip}</Tooltip>);
    } else {
      tooltip = this.props.tooltip;
    }

    return (
      <OverlayTrigger
        placement="bottom"
        overlay={tooltip}
        delay={600}
        children={this.props.children}
      />
    );
  }

}

module.exports = OverlayTooltip;
