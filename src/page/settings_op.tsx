import { Card, Col, Form, notification, Row, Select, Skeleton, } from 'antd';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { DesktopOutlined, WifiOutlined, GlobalOutlined, CalendarOutlined, ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { DatePicker, TimePicker, Button, InputNumber, } from '../components';
import format from 'dayjs';
import dayjs from 'dayjs';

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as 'column' }
const { Option } = Select;

type Props = {
};

const SettingsOp: React.FC<Props> = ({
}) => {
  const { t, i18n } = useTranslation();

  let isSubscribed = true;

  const [form] = Form.useForm()
  const [formIP] = Form.useForm()
  const [loading, setLoading] = useState(true)

  const openNotificationWithIcon = (type: string, message: string, dur: number, descr?: string, style?: React.CSSProperties) => {
    if (type == 'success' || type == 'warning' || type == 'info' || type == 'error')
      notification[type]({
        message: message,
        description: descr,
        placement: 'bottomRight',
        duration: dur,
        style: style,
      });
  }

  return (
    <div className='wrapper'>
      <Row gutter={[8, 8]} style={{ flex: '1 1 30%', marginBottom: 8 }}>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.language')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Skeleton loading={loading} round active>

            </Skeleton>
          </Card>
        </Col>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.actions')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Skeleton loading={loading} round active>
            </Skeleton>
          </Card>
        </Col>
      </Row>
      <Row gutter={[8, 8]} style={{ flex: '1 1 70%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.network')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Skeleton loading={loading} round active>

            </Skeleton>
          </Card>
        </Col>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('time.title')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle} >
            <Skeleton loading={loading} round active>

            </Skeleton>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SettingsOp
