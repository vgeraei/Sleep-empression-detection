import React, { useState, useEffect } from "react";

import {
  Button,
  Input,
  Menu,
  Breadcrumb,
  Row,
  Col,
  Steps,
  Space,
  Typography,
  Divider,
  message,
} from "antd";

import {
  UserOutlined,
  SolutionOutlined,
  LoadingOutlined,
  SmileOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";
import CustomCheckItem from "../Components/CustomCheckItem";
import CustomTooltip from "../Components/CustomTooltip";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import axios from "axios";
import { useHistory } from "react-router-dom";

const userCodeSuffix = (
  <UserOutlined
    style={{
      fontSize: 16,
      color: "#1890ff",
    }}
  />
);

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

function Login() {
  const [loginLoading, setLoginLoading] = useState(false);
  const history = useHistory();

  const checkUser = (userId) => {
    if (userId) {
      setLoginLoading(true);
      axios
        .get("does-user-exist/" + userId + "/")
        .then((response) => {
          setLoginLoading(false);
          if (response.data == "Exists") {
            history.push("/experiment/" + userId);
          } else {
            message.error("کد کاربری یافت نشد.");
          }
        })
        .catch(() => {
          setLoginLoading(false);
          message.error("لطفا مجددا تلاش کنید.");
        });
    }
  };

  return (
    <div
      className="site-layout-background"
      style={{ padding: "8%", minHeight: 380 }}
    >
      <Row justify="center" style={{ margin: "0 0 50px 0" }}>
        <Steps style={{ width: "80%" }}>
          <Step status="finish" title="ورود" icon={<UserOutlined />} />
          <Step status="wait" title="ثبت نام" icon={<SolutionOutlined />} />

          <Step status="wait" title="آزمایش" icon={<SmileOutlined />} />
        </Steps>
      </Row>

      <Row>
        <Col span={14} style={{ padding: "0 20px" }}>
          <Title level={4}>شروط آزمایش</Title>
          <Paragraph>
            داوطلب گرامی، در صورتی که تمام شرایط زیر برای شما صادق است می‌توانید
            در آزمایش شرکت کنید.{" "}
          </Paragraph>
          <Divider />
          <CustomCheckItem
            text="نداشتن خستگی مضاعف"
            tip="در مقیاس ده نمره‌ای خستگی  بیشتر از نمره ۳"
          />
          <CustomCheckItem text="عدم مصرف نوشیدنی‌های حاوی کافئین" />
          <CustomCheckItem text="عدم مصرف داروهای تاثیرگذار در خواب" />
          <CustomCheckItem text="عدم ابتلا به کم خونی شدید" />
          <CustomCheckItem text="عدم ابتلا به افسردگی شدید" />
          <CustomCheckItem text="همزمان نبودن آزمون با هفته عادت ماهیانه" />
        </Col>
        <Col span={10} style={{ padding: "0 20px" }}>
          <Title level={4}>ثبت نام</Title>
          <Paragraph>
            در صورتی که این اولین آزمایش شماست از این قسمت مراحل آزمایش را شروع
            کنید.
          </Paragraph>

          <Row justify="center">
            <Link to="/register">
              <Button type="primary" size="large">
                ثبت نام در آزمایش
              </Button>
            </Link>
          </Row>

          <Divider />

          <Title level={4} style={{ marginTop: 20 }}>
            ورود مجدد
          </Title>
          <Paragraph>
            برای انجام آزمایش مجدد کد کاربری خود را وارد کرده و از اینجا وارد
            شوید.
          </Paragraph>

          <Row justify="center">
            <Search
              loading={loginLoading}
              style={{ maxWidth: 250 }}
              placeholder="کد کاربری"
              enterButton="ورود"
              size="large"
              prefix={userCodeSuffix}
              onSearch={checkUser}
            />
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default Login;
