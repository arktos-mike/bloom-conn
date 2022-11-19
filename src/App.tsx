import React, { useState, useEffect, useRef } from 'react'
import logo from '/icon.svg'
import 'styles/app.less'
import { Route, Link, Routes, useLocation, Navigate } from 'react-router-dom';
import { Layout, Menu, Select, Drawer, Button, Input, notification, ConfigProvider, Space, Progress, Avatar, Tooltip, Spin, Badge } from 'antd';
import { BellOutlined, ReconciliationOutlined, TagsOutlined, ReadOutlined, ScheduleOutlined, ToolOutlined, QuestionCircleOutlined, SyncOutlined, LoadingOutlined, AimOutlined, DashboardOutlined, CloseCircleTwoTone, EyeTwoTone, EyeInvisibleOutlined, GlobalOutlined, CloseOutlined, ToTopOutlined, VerticalAlignBottomOutlined, EyeOutlined, TeamOutlined, SettingOutlined, UserOutlined, CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import { ButtonIcon, FabricFullIcon, WarpBeamIcon, WeftIcon } from "./components/Icons"

import Overview from "./page/overview";
import Settings from "./page/settings";
import MonthReport from "./page/month_report";
import UserReport from "./page/user_report";

import './i18n/config';
import { useTranslation } from 'react-i18next';
import rulocale from 'antd/lib/locale/ru_RU';
import trlocale from 'antd/lib/locale/tr_TR';
import eslocale from 'antd/lib/locale/es_ES';
import enlocale from 'antd/lib/locale/en_US';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
import isBetween from 'dayjs/plugin/isBetween';
import { Breadcrumb } from './components';
dayjs.extend(isBetween);
import { differenceWith, isEqual } from 'lodash-es';

const Store = require('electron-store');
const store = new Store();

const { Header, Content, Footer } = Layout;
const { Option } = Select;

const App: React.FC = () => {
  const location = useLocation();
  const openNotificationWithIcon = (type: string, message: string, dur: number, key?: string, descr?: string, style?: React.CSSProperties) => {
    if (type == 'success' || type == 'warning' || type == 'info' || type == 'error') {
      notification[type]({
        key: key,
        message: message,
        description: descr,
        placement: 'bottomRight',
        duration: dur,
        style: style,
      });
    }
  };

  const { t, i18n } = useTranslation();

  const [today, setDate] = useState(new Date())
  const [visible, setVisible] = useState(false)
  const [updated, setUpdated] = useState(false)
  const [openKeys, setOpenKeys] = useState(['']);

  const onOpenChange = (keys: any) => {
    const latestOpenKey = keys.find((key: any) => openKeys.indexOf(key) === -1);
    if (['settings', 'logs', 'reports'].indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const showDrawer = () => {
    setVisible(!visible);
  }

  const curDate = today.toLocaleDateString(i18n.language == 'en' ? 'en-GB' : i18n.language, { day: 'numeric', month: 'numeric', year: 'numeric', });
  const curTime = `${today.toLocaleTimeString(i18n.language == 'en' ? 'en-GB' : i18n.language, { hour: 'numeric', minute: 'numeric', hour12: false })}\n\n`;

  const clock = async () => {
    let curTime = new Date();
    let sec = (60 - curTime.getSeconds()) * 1000;
    await setTimeout(() => {
      setDate(new Date());
      const timer = setInterval(() => { // Creates an interval which will update the current data every minute
        // This will trigger a rerender every component that uses the useDate hook.
        setDate(new Date());
      }, 60000);
      return () => {
        clearInterval(timer); // Return a funtion to clear the timer so that it will stop being called on unmount
      }
    }, sec);
  }

  const lngChange = async (lang: string) => {
    i18n.changeLanguage(lang)
    dayjs.locale(lang)
    store.set('lng', lang)
  }

  useEffect(() => {
    clock();
    setUpdated(true);
  }, [])

  const bigItems = [
    { label: <Link onClick={showDrawer} to="/">{t('menu.overview')}</Link>, title: '', key: 'overview', icon: <EyeOutlined style={{ fontSize: '100%' }} /> },
    { label: t('menu.settings'), title: '', key: 'settings', icon: <SettingOutlined style={{ fontSize: '100%' }} />, children: [{ label: <Link onClick={showDrawer} to="/settings/settingsNet">{t('menu.settingsNet')}</Link>, title: '', key: 'settingsNet', },] },
    { label: t('menu.reports'), title: '', key: 'reports', icon: <ReconciliationOutlined style={{ fontSize: '100%' }} />, children: [{ label: <Link onClick={showDrawer} to="/reports/monthReport">{t('menu.monthReport')}</Link>, title: '', key: 'monthReport', }, { label: <Link onClick={showDrawer} to="/reports/userReport">{t('menu.userReport')}</Link>, title: '', key: 'userReport', }] },
  ];

  return (
    <div>
      <ConfigProvider locale={i18n.language === 'en' ? enlocale : i18n.language === 'ru' ? rulocale : i18n.language === 'tr' ? trlocale : i18n.language === 'es' ? eslocale : enlocale}>
        <Layout className="layout">
          <Header style={{ position: 'fixed', zIndex: 1, width: '100%', padding: 0, display: 'inline-flex', justifyContent: "space-between" }}>
            <div className="logo" onClick={showDrawer}>
              <img src={logo} className="applogo" alt=""></img>
            </div>
            <div className="mode">{t('menu.'+(location.pathname == '/' ? 'title' : location.pathname.split("/").filter((item) => item).slice(-1)[0] ))}</div>
            <div className="lang">
              <Select value={i18n.language} optionLabelProp="label" onChange={lngChange} size="large" dropdownStyle={{ fontSize: '40px !important' }} dropdownAlign={{ offset: [-40, 4] }} dropdownMatchSelectWidth={false} style={{ color: "white" }} bordered={false} >
                {(store.get('lngs')).map((lng: string) => (
                  <Option key={lng} value={lng} label={lng.toUpperCase()}>
                    <div>{lng.toUpperCase()} - {t('self', { lng: lng })}</div></Option>
                ))}
              </Select>
            </div>
            <div className="clock">
              <div className="time">{curTime}</div><div className="date">{curDate}</div>
            </div>
          </Header>
          <div className="site-drawer-render-in-current-wrapper">
            <Content className="content">
              <div>
                <Breadcrumb />
              </div>
              <div className="site-layout-content">
                <Routes>
                  <Route index element={<Overview />} />
                  <Route path={'/reports'} element={<MonthReport />} />
                  <Route path={'/reports/monthReport'} element={<MonthReport />} />
                  <Route path={'/reports/userReport'} element={<UserReport />} />
                  <Route path={'/settings'} element={<Settings />} />
                  <Route path={'/settings/settingsNet'} element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <Drawer
                  placement="left"
                  closable={false}
                  open={visible}
                  getContainer={false}
                  style={{ position: 'absolute', }}
                  bodyStyle={{ margin: "0px", padding: "0px" }}
                >
                  <Menu style={{ fontSize: '150%' }} mode="inline" items={bigItems} openKeys={openKeys} onOpenChange={onOpenChange} selectedKeys={location.pathname == '/' ? ['overview'] : location.pathname.split("/").filter((item) => item)} defaultSelectedKeys={['overview']}>
                  </Menu>
                </Drawer>
              </div>
            </Content>
            <Footer style={{ textAlign: 'center', margin: '0px', padding: '3px', color: 'rgba(0, 0, 0, 0.45)' }}>{t('footer')}</Footer>
          </div>
        </Layout>
      </ConfigProvider>
    </div >
  )
}

export default App
