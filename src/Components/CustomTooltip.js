import React, { Component, useState, useMemo } from "react";
import { Space, Tooltip } from "antd";

import { ExclamationCircleOutlined } from "@ant-design/icons";

function CustomTooltip(props) {
  return (
    <Tooltip placement="top" title={props.text}>
      <ExclamationCircleOutlined style={{textSize: "10px"}} />
    </Tooltip>
  );
}

export default CustomTooltip;
