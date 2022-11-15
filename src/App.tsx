import React, { useState, useEffect, useRef } from 'react'
import logo from '/icon.svg'
import 'styles/app.less'
import { Route, Link, Routes, useLocation, Navigate } from 'react-router-dom';
import { Layout, Menu, Select, Drawer, Button, Input, notification, ConfigProvider, Space, Progress, Avatar, Tooltip, Spin, Badge } from 'antd';
import { BellOutlined, ReconciliationOutlined, TagsOutlined, ReadOutlined, ScheduleOutlined, ToolOutlined, QuestionCircleOutlined, SyncOutlined, LoadingOutlined, AimOutlined, DashboardOutlined, CloseCircleTwoTone, EyeTwoTone, EyeInvisibleOutlined, GlobalOutlined, CloseOutlined, ToTopOutlined, VerticalAlignBottomOutlined, EyeOutlined, TeamOutlined, SettingOutlined, UserOutlined, CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import { ButtonIcon, FabricFullIcon, WarpBeamIcon, WeftIcon } from "./components/Icons"

import Overview from "./page/overview";
import SettingsOp from "./page/settings_op";
import SettingsDev from "./page/settings_dev";
import Users from "./page/users";
import UserLogin from "./dialog/UserLogin";
import Shifts from "./page/shifts";
import ModeLog from "./page/modelog";
import UserLog from "./page/userlog";
import ClothLog from "./page/clothlog";
import MonthReport from "./page/month_report";
import UserReport from "./page/user_report";
import SettingsTech from './page/settings_tech';

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

  const [modeCode, setModeCode] = useState({ val: 0, updated: {} });
  const [lngs, setLngs] = useState({ data: [] })
  const [token, setToken] = useState<string | null>(null)
  const [remember, setRemember] = useState(true)
  const [today, setDate] = useState(new Date())
  const [visible, setVisible] = useState(false)
  const [userDialogVisible, setUserDialogVisible] = useState(false)
  const [tags, setTags] = useState({ data: [] })
  const [shift, setShift] = useState({ name: '', start: '', end: '', duration: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0, starts: 0, runtime: '', stops: {} })
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

  const showUserDialog = () => {
    setUserDialogVisible(true);
  }

  const avatarColor = () => {
    let color;
    let role = token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role
    if (role == 'fixer') { color = "#108ee9" }
    else if (role == 'weaver') { color = "#87d068" }
    else if (role == 'manager') { color = "#2db7f5" }
    else if (role == 'admin') { color = "#f50" }
    else { color = "#0000006F" }
    return color;
  }

  const modeCodeObj = (code: Number) => {
    let obj;
    if (code == 0) { obj = { color: '#000000FF', text: t('tags.mode.init'), icon: <LoadingOutlined style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 1) { obj = { color: '#43A047FF', text: t('tags.mode.run'), icon: <SyncOutlined spin style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 2) { obj = { color: '#7339ABFF', text: t('tags.mode.stop'), icon: <ButtonIcon style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 3) { obj = { color: '#FF7F27FF', text: t('tags.mode.stop'), icon: <WarpBeamIcon style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 4) { obj = { color: '#FFB300FF', text: t('tags.mode.stop'), icon: <WeftIcon style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 5) { obj = { color: '#E53935FF', text: t('tags.mode.stop'), icon: <ToolOutlined style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 6) { obj = { color: '#005498FF', text: t('tags.mode.stop'), icon: <FabricFullIcon style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else { obj = { color: '#00000000', text: t('tags.mode.unknown'), icon: <QuestionCircleOutlined style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    return obj;
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

  const stopwatch = (start: any) => {
    let diff = dayjs.duration(dayjs().diff(start))
    return (diff.days() > 0 ? diff.days() + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + t('shift.secs') : "")
  }

  const fetchLngs = async () => {
    try {
      const response = await fetch('http://localhost:3000/locales');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setLngs({ data: json });
    }
    catch (error) { console.log(error); }
  }

  const fetchTags = async (tagNames: string[]) => {
    try {
      const response = await fetch('http://localhost:3000/tags/filter', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ name: tagNames }),
      });
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      (json || []).map((tag: any) => (
        tag['val'] = Number(tag['val']).toFixed(tag['tag']['dec']).toString()));
      setTags({ data: json });
      let obj = tags.data.find(o => o['tag']['name'] == 'modeCode')
      obj && setModeCode({ val: obj['val'], updated: dayjs(obj['updated']) })
    }
    catch (error) { console.log(error); }
  }

  const getTagLink = (tagName: string) => {
    let obj = tags.data.find(o => o['tag']['name'] == tagName)
    if (obj) { return obj['link'] }
    else { return false };
  }

  const getTagVal = (tagName: string) => {
    let obj = tags.data.find(o => o['tag']['name'] == tagName)
    if (obj) { return Number(obj['val']).toLocaleString(i18n.language); }
    else { return null };
  }

  const fetchShift = async () => {
    try {
      const response = await fetch('http://localhost:3000/shifts/currentshift');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setShift({ ...shift, name: json[0]['shiftname'], start: json[0]['shiftstart'], end: json[0]['shiftend'], duration: json[0]['shiftdur'] });
      setUpdated(false);
    }
    catch (error) { console.log(error); }
  };
  const fetchStatInfo = async () => {
    try {
      if (shift.start && shift.end) {
        const response = await fetch('http://localhost:3000/shifts/getstatinfo', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ start: shift.start, end: new Date() }),
        });
        if (!response.ok) { throw Error(response.statusText); }
        const json = await response.json();
        setShift({ ...shift, picks: json[0]['picks'] || 0, meters: json[0]['meters'] || 0, rpm: json[0]['rpm'] || 0, mph: json[0]['mph'] || 0, efficiency: json[0]['efficiency'] || 0, starts: json[0]['starts'] || 0, runtime: json[0]['runtime'] || '', stops: json[0]['stops'] || {} });
        setUpdated(false);
      }
    }
    catch (error) { console.log(error); }
  };

  useEffect(() => {
    clock();
    fetchLngs();
    fetchShift();
    setUpdated(true);
  }, [])

  useEffect(() => {
    fetchTags(['modeCode', 'stopAngle', 'speedMainDrive']);
    fetchStatInfo();
  }, [tags])

  useEffect(() => {
    fetchShift();
  }, [updated, shift.end && dayjs().isAfter(shift.end)])

  useEffect(() => {
    setToken(token);
  }, [token])

  useEffect(() => {
    setRemember(remember)
  }, [remember])

  const smallItems = [
    { label: <Link to="/"><EyeOutlined style={{ fontSize: '100%' }} /></Link>, title: '', key: 'overview' },
  ];
  const smallItemsSA = [
    { label: <Link to="/"><EyeOutlined style={{ fontSize: '100%' }} /></Link>, title: '', key: 'overview' },
    { label: <Link to="/users"><TeamOutlined style={{ fontSize: '100%' }} /></Link>, title: '', key: 'users' },
    { label: <Link to="/shifts"><ScheduleOutlined style={{ fontSize: '100%' }} /></Link>, title: '', key: 'shifts' },
    { label: <Link to="/reminders"><BellOutlined style={{ fontSize: '100%' }} /></Link>, title: '', key: 'reminders' },
  ];
  const bigItems = [
    { label: <Link onClick={showDrawer} to="/">{t('menu.overview')}</Link>, title: '', key: 'overview', icon: <EyeOutlined style={{ fontSize: '100%' }} /> },
    { label: t('menu.settings'), title: '', key: 'settings', icon: <SettingOutlined style={{ fontSize: '100%' }} />, children: [{ label: <Link onClick={showDrawer} to="/settings/settingsTech">{t('menu.settingsTech')}</Link>, title: '', key: 'settingsTech', }, { label: <Link onClick={showDrawer} to="/settings/settingsOp">{t('menu.settingsOp')}</Link>, title: '', key: 'settingsOp', }, { label: <Link onClick={showDrawer} to="/settings/settingsDev">{t('menu.settingsDev')}</Link>, title: '', key: 'settingsDev', }] },
    { label: t('menu.reports'), title: '', key: 'reports', icon: <ReconciliationOutlined style={{ fontSize: '100%' }} />, children: [{ label: <Link onClick={showDrawer} to="/reports/monthReport">{t('menu.monthReport')}</Link>, title: '', key: 'monthReport', }, { label: <Link onClick={showDrawer} to="/reports/userReport">{t('menu.userReport')}</Link>, title: '', key: 'userReport', }] },
    { label: t('menu.logs'), title: '', key: 'logs', icon: <ReadOutlined style={{ fontSize: '100%' }} />, children: [{ label: <Link onClick={showDrawer} to="/logs/modelog">{t('menu.modelog')}</Link>, title: '', key: 'modelog', }, { label: <Link onClick={showDrawer} to="/logs/userlog">{t('menu.userlog')}</Link>, title: '', key: 'userlog', }, { label: <Link onClick={showDrawer} to="/logs/clothlog">{t('menu.clothlog')}</Link>, title: '', key: 'clothlog', }] },
  ];

  return (
    <div>
      <ConfigProvider locale={i18n.language === 'en' ? enlocale : i18n.language === 'ru' ? rulocale : i18n.language === 'tr' ? trlocale : i18n.language === 'es' ? eslocale : enlocale}>
        <Layout className="layout">
          <Header style={{ position: 'fixed', zIndex: 1, width: '100%', padding: 0, display: 'inline-flex', justifyContent: "space-between" }}>
            <div className="logo" onClick={showDrawer}>
              <img src={logo} className="applogo" alt=""></img>
            </div>
            <Menu style={{ fontSize: '150%' }} disabledOverflow theme='dark' mode="horizontal" selectedKeys={location.pathname == '/' ? ['overview'] : [location.pathname.split("/").slice(-1)[0]]} defaultSelectedKeys={['overview']} items={token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'admin' ? smallItemsSA : smallItems : smallItems} />
            <div className="speed"><Spin wrapperClassName="speed" spinning={modeCode.val == 1 ? !getTagLink('speedMainDrive') : !getTagLink('stopAngle')}>{modeCode.val == 1 ? <DashboardOutlined style={{ fontSize: '80%', paddingInline: 5 }} /> : <AimOutlined style={{ fontSize: '80%', paddingInline: 5 }} />}{modeCode.val == 1 ? getTagVal('speedMainDrive') : getTagVal('stopAngle')}<div className="sub">{modeCode.val == 1 ? t('tags.speedMainDrive.eng') : '°'}</div></Spin></div>
            <div className="mode" style={{ backgroundColor: modeCodeObj(modeCode.val).color }}><Spin wrapperClassName="mode" spinning={!getTagLink('modeCode')}>{modeCodeObj(modeCode.val).text + ' '}{modeCodeObj(modeCode.val).icon}<div className='stopwatch'>{stopwatch(modeCode.updated)}</div></Spin></div>
            {shift.name && <div className="shift"><div className="text"><Space direction="horizontal" style={{ width: '100%', justifyContent: 'center' }}>{t('shift.shift') + ' ' + shift.name}<div className="percent">{Number(Number(shift.efficiency).toFixed(shift.efficiency < 10 ? 2 : 1).toString()).toLocaleString(i18n.language) + '%'}</div></Space></div><div className="progress"><Progress percent={shift.efficiency} showInfo={false} size="small" /></div></div>}
            <div className="user">
              <div className="user" onClick={() => { !visible && showUserDialog() }}>
                 <Avatar size={50} style={{ backgroundColor: avatarColor() }} icon={<UserOutlined />} />
                <table><tbody><tr><td><div className='username'>{token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).name : t('user.anon')}</div></td></tr><tr><td><div className='userrole'>{t(token ? 'user.' + JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role : '')}</div></td></tr></tbody></table>
              </div><UserLogin token={token} setToken={setToken} isModalVisible={userDialogVisible} setIsModalVisible={setUserDialogVisible} setRemember={setRemember} />
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
                  <Route index element={<Overview token={token} modeCode={modeCode} shift={shift} />} />
                  <Route path={'/reports'} element={<MonthReport token={token} />} />
                  <Route path={'/reports/monthReport'} element={<MonthReport token={token} />} />
                  <Route path={'/reports/userReport'} element={<UserReport token={token} />} />
                  <Route path={'/logs'} element={<ModeLog token={token} />} />
                  <Route path={'/logs/modelog'} element={<ModeLog token={token} />} />
                  <Route path={'/logs/userlog'} element={<UserLog token={token} />} />
                  <Route path={'/logs/clothlog'} element={<ClothLog token={token} />} />
                  <Route path={'/settings'} element={<SettingsTech token={token} modeCode={modeCode} />} />
                  <Route path={'/settings/settingsTech'} element={<SettingsTech token={token} modeCode={modeCode} />} />
                  <Route path={'/settings/settingsOp'} element={<SettingsOp token={token} />} />
                  <Route path={'/settings/settingsDev'} element={<SettingsDev token={token} />} />
                  <Route path={'/users'} element={token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'admin' ? <Users token={token} /> : <Navigate to="/" /> : <Navigate to="/" />} />
                  <Route path={'/shifts'} element={token ? ['manager', 'admin'].includes(JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role) ? <Shifts setUpdated={setUpdated} /> : <Navigate to="/" /> : <Navigate to="/" />} />
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
