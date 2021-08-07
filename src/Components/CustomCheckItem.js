import React, { Component, useState, useMemo } from "react";
import { Space, Tooltip, Row, Col, Typography } from "antd";

import { ExclamationCircleOutlined } from "@ant-design/icons";
import { CheckCircleTwoTone } from "@ant-design/icons";
import CustomTooltip from "./CustomTooltip";

const { Title, Text, Paragraph } = Typography;

function CustomCheckItem(props) {
  let tooltip = null;
  if (props.tip) {
    tooltip = <CustomTooltip text={props.tip} />;
  }

  return (
    <Row align="middle" wrap={false} className="check-item">
      <Col>
        <CheckCircleTwoTone
          style={{ fontSize: "22px", margin: "0 0 0 10px" }}
        />{" "}
      </Col>
      <Col flex="auto">
        <Text style={{ lineHeight: 1.8 }}>{props.text} </Text>
        {tooltip}
      </Col>
    </Row>
  );
}

export default CustomCheckItem;
