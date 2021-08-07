import React, { useState, useEffect, useMemo } from "react";

import {
  Button,
  Input,
  Row,
  Col,
  Form,
  Select,
  Steps,
  Space,
  Typography,
  Divider,
  Spin,
  Result,
  Tooltip,
  InputNumber,
  message,
} from "antd";

import {
  UserOutlined,
  SolutionOutlined,
  LoadingOutlined,
  CopyOutlined,
  SmileOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";

import { CopyToClipboard } from "react-copy-to-clipboard";
import axios from "axios";

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

function Register() {
  const [userId, setUserId] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [dummyValue, setDummyValue] = useState(0);
  const [registerContent, setRegisterContent] = useState(null);

  let [formData] = Form.useForm();

  const SubmitForm = () => {
    setRegisterLoading(true);
    let formValues = formData.getFieldsValue(true);
    axios
      .post("register/", formValues)
      .then((response) => {
        setRegisterLoading(false);
        message.success("ثبت نام با موفقیت انجام شد.");
        setUserId(response.data);

        console.log(registerContent);
      })
      .catch(() => {
        setRegisterLoading(false);
        message.warning("ثبت نام موفقت آمیز نبود. لطفا مجددا تلاش کنید.");
      });
  };

  useEffect(() => {
    if (!userId) {
      setRegisterContent(
        <Spin tip="در حال بارگذاری..." spinning={registerLoading}>
          <Title level={4}>اطلاعات ثبت نام</Title>
          <Paragraph>
            داوطلب گرامی، لطفا اطلاعات زیر را تکمیل کرده و پس از ثبت نام کد
            کاربری خود را برای آزمایش‌های مجدد ذخیره کنید.
          </Paragraph>
          <Divider />

          <Row>
            <Form
              name="register-form"
              form={formData}
              labelCol={{ span: 12 }}
              wrapperCol={{ span: 12 }}
            >
              <Form.Item label="جنسیت">
                <Space>
                  <Form.Item
                    name="gender"
                    noStyle
                    rules={[
                      {
                        required: true,
                        message: "لطفا جنسیت خود را وارد کنید.",
                      },
                    ]}
                  >
                    <Select placeholder="انتخاب جنسیت">
                      <Option value="female">زن</Option>
                      <Option value="male">مرد</Option>
                    </Select>
                  </Form.Item>
                </Space>
              </Form.Item>

              <Form.Item label="سن">
                <Space>
                  <Form.Item
                    name="age"
                    noStyle
                    rules={[
                      {
                        required: true,
                        type: "number",
                        min: 18,
                        max: 99,
                        message: "سن باید عددی بالای ۱۸ باشد.",
                      },
                    ]}
                  >
                    <InputNumber placeholder="مثال: ۲۵" />
                  </Form.Item>
                </Space>
              </Form.Item>

              <Form.Item label="شغل">
                <Space>
                  <Form.Item
                    name="occupation"
                    noStyle
                    rules={[
                      { required: true, message: "لطفا شغل خود را وارد کنید." },
                    ]}
                  >
                    <Input
                      style={{ width: 350 }}
                      placeholder="مثال: برنامه‌نویس"
                    />
                  </Form.Item>
                </Space>
              </Form.Item>

              <Form.Item label="سطح تحصیلات">
                <Space>
                  <Form.Item
                    name="education"
                    noStyle
                    rules={[
                      {
                        required: true,
                        message: "لطفا سطح تحصیلات خود را وارد کنید.",
                      },
                    ]}
                  >
                    <Select
                      placeholder="انتخاب سطح تحصیلات"
                      style={{ width: 300 }}
                    >
                      <Option value="highSchool">دیپلم</Option>
                      <Option value="bachelor">لیسانس</Option>
                      <Option value="master">فوق لیسانس</Option>
                      <Option value="phd">دکترا</Option>
                    </Select>
                  </Form.Item>
                </Space>
              </Form.Item>

              <Form.Item label=" " colon={false}>
                <Button type="primary" onClick={SubmitForm} size="large">
                  تکمیل ثبت نام
                </Button>
              </Form.Item>
            </Form>
          </Row>
        </Spin>
      );
    } else {
      setRegisterContent(
        <Row justify="center">
          <Result
            status="success"
            title="ثبت نام شما با موفقیت انجام شد."
            subTitle="داوطلب گرامی، لطفا کد کاربری خود را برای آزمایش‌های مجدد ذخیره کنید."
            extra={[
              <Link to={"/experiment/" + userId}>
                <Button type="primary" key="console">
                  انجام آزمایش
                </Button>
              </Link>,
              <Input
                style={{ width: 250 }}
                value={userId}
                addonAfter={
                  <Tooltip
                    placement="top"
                    title="کپی کد کاربری"
                    onClick={() => copyToClipboard()}
                  >
                    <CopyToClipboard
                      onCopy={() => copyToClipboard()}
                      text={userId}
                    >
                      <CopyOutlined />
                    </CopyToClipboard>
                  </Tooltip>
                }
                disabled={true}
              />,
            ]}
          />
        </Row>
      );
    }
  }, [userId, dummyValue]);

  const copyToClipboard = () => {
    message.info("کد کاربری کپی شد.");
  };

  return (
    <div
      className="site-layout-background"
      style={{ padding: "8%", minHeight: 380 }}
    >
      <Row justify="center" style={{ margin: "0 0 50px 0" }}>
        <Steps style={{ width: "80%" }}>
          <Step status="finish" title="ورود" icon={<UserOutlined />} />
          <Step status="finish" title="ثبت نام" icon={<SolutionOutlined />} />

          <Step status="wait" title="آزمایش" icon={<SmileOutlined />} />
        </Steps>
      </Row>
      {registerContent}
    </div>
  );
}

export default Register;
