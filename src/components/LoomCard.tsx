import { Card, Form, Space, Spin } from "antd";
import { useTranslation } from 'react-i18next';
import { ToolOutlined, QuestionCircleOutlined, LoadingOutlined, SyncOutlined, DashboardOutlined, ClockCircleOutlined, RiseOutlined, ScheduleOutlined, UserOutlined, ReconciliationOutlined, HistoryOutlined } from '@ant-design/icons';
import { FabricFullIcon, ButtonIcon, WeftIcon, WarpBeamIcon } from '@/components/Icons';
import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
import isBetween from 'dayjs/plugin/isBetween';
import Meta from "antd/lib/card/Meta";
import Donut from "./Donut";
import LoomDetail from "@/dialog/LoomDetail";
dayjs.extend(isBetween);

const Component = (props: any) => {
  const { t, i18n } = useTranslation();
  const [shift, setShift] = useState({ name: '', start: '', end: '', duration: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0, starts: 0, runtime: '', stops: {} })
  const [modeCode, setModeCode] = useState({ val: 0, updated: {} });
  const [tags, setTags] = useState({ data: [] });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [weaver, setWeaver] = useState('');
  const [shiftDonut, setShiftDonut] = useState([] as any)
  const [shiftDonutSel, setShiftDonutSel] = useState({ run: true, other: true, button: true, warp: true, weft: true, tool: true, fabric: true } as any)

  const [formShift] = Form.useForm();

  const stopwatch = (start: any) => {
    let diff = dayjs.duration(dayjs().diff(start))
    return (diff.days() > 0 ? diff.days() + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + t('shift.secs') : "")
  }

  const modeCodeObj = (code: Number) => {
    let obj;
    if (code == 0) { obj = { color: '#000000FF', colorOp: '#000000BB', text: t('tags.mode.init'), icon: <LoadingOutlined style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 1) { obj = { color: '#43A047FF', colorOp: '#43A047BB', text: t('tags.mode.run'), icon: <SyncOutlined spin style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 2) { obj = { color: '#7339ABFF', colorOp: '#7339ABBB', text: t('tags.mode.stop'), icon: <ButtonIcon style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 3) { obj = { color: '#FF7F27FF', colorOp: '#FF7F27BB', text: t('tags.mode.stop'), icon: <WarpBeamIcon style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 4) { obj = { color: '#FFB300FF', colorOp: '#FFB300BB', text: t('tags.mode.stop'), icon: <WeftIcon style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 5) { obj = { color: '#E53935FF', colorOp: '#E53935BB', text: t('tags.mode.stop'), icon: <ToolOutlined style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 6) { obj = { color: '#005498FF', colorOp: '#005498BB', text: t('tags.mode.stop'), icon: <FabricFullIcon style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else { obj = { color: '#00000000', text: t('tags.mode.unknown'), icon: <QuestionCircleOutlined style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    return obj;
  }

  const cardStyle = { backgroundColor: modeCodeObj(modeCode.val).color, width: '100%', display: 'flex',  height: '210px', flexDirection: 'column' as 'column' }
  const cardHeadStyle = { background: modeCodeObj(modeCode.val).color, color: "white" }
  const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as 'column' }

  const duration2text = (diff: any) => {
    if (diff == null) return null
    return (diff.days() > 0 ? diff.days() + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + t('shift.secs') : "")
  }

  function localeParseFloat(str: String) {
    let out: String[] = [];
    let thousandsSeparator = Number(10000).toLocaleString().charAt(2)
    str.split(Number(1.1).toLocaleString().charAt(1)).map(function (x) {
      x = x.replace(thousandsSeparator, "");
      out.push(x);
    })
    return parseFloat(out.join("."));
  }

  const fetchShift = async () => {
    try {
      const response = await fetch('http://' + props.machine?.ip + ':3000/shifts/currentshift');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setShift({ ...shift, name: json[0]['shiftname'], start: json[0]['shiftstart'], end: json[0]['shiftend'], duration: json[0]['shiftdur'] });
    }
    catch (error) { console.log(error); }
  };

  const fetchTags = async (tagNames: string[]) => {
    try {
      const response = await fetch('http://' + props.machine?.ip + ':3000/tags/filter', {
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

  const fetchStatInfo = async () => {
    try {
      if (shift.start && shift.end) {
        const response = await fetch('http://' + props.machine?.ip + ':3000/shifts/getstatinfo', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ start: props.period ? props.period == 'shift' ? shift.start : props.period == 'month' ? dayjs().startOf('month') : dayjs().startOf('day') : dayjs().startOf('day'), end: new Date() }),
        });
        if (!response.ok) { throw Error(response.statusText); }
        const json = await response.json();
        setShift({ ...shift, picks: json[0]['picks'] || 0, meters: json[0]['meters'] || 0, rpm: json[0]['rpm'] || 0, mph: json[0]['mph'] || 0, efficiency: json[0]['efficiency'] || 0, starts: json[0]['starts'] || 0, runtime: json[0]['runtime'] || '', stops: json[0]['stops'] || {} });
      }
    }
    catch (error) { console.log(error); }
  };

  const fetchWeaver = async () => {
    try {
      const ans = await fetch('http://' + props.machine?.ip + ':3000/logs/user');
      if (!ans.ok) { throw Error(ans.statusText); }
      const json = await ans.json();
      setWeaver(json[0] ? json[0].name : '')
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

  useEffect(() => {
    fetchShift();
  }, [])

  useEffect(() => {
    let obj = []
    if (Array.isArray(shift['stops'])) {
      obj.push({ reason: 'run', value: dayjs.duration(shift['runtime']).asMilliseconds(), count: Number(shift['starts']) })
      for (let stop of shift['stops']) {
        obj.push({ reason: Object.keys(stop)[0], value: dayjs.duration(stop[Object.keys(stop)[0]]['dur']).asMilliseconds(), count: stop[Object.keys(stop)[0]]['total'] })
      }
      setShiftDonut(obj);
    }
  }, [shift])

  useEffect(() => {
    fetchTags(['modeCode', 'stopAngle', 'speedMainDrive']);
    fetchStatInfo();
    fetchWeaver();
  }, [tags, dayjs().minute()])

  useEffect(() => {
    fetchShift();
  }, [shift.end && dayjs().isAfter(shift.end)])

  return (
    <>
    <LoomDetail isModalVisible={isModalVisible} shift={shift} machine={props.machine} tags={tags} modeCode={modeCode} setIsModalVisible={setIsModalVisible} />
    <Card onClick={()=>{setIsModalVisible(!isModalVisible)}} title={<Space direction="horizontal" style={{ width: '100%', justifyContent: 'space-between' }}><b style={{ fontSize: '150%' }}>{props.machine?.name}</b><span style={{ color: '#FFFFFF93', fontSize: '120%' }}>{stopwatch(modeCode.updated)}</span><span style={{ fontSize: '150%' }}>{modeCodeObj(modeCode.val).icon}</span></Space>} loading={!getTagLink('modeCode')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle} >
      <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '30%', height: '112px' }}>
          <Donut data={shiftDonut} selected={shiftDonutSel} text={(Number(Number(shift['efficiency']).toFixed(shift['efficiency'] < 10 ? 2 : 1)).toLocaleString(i18n.language) + t('tags.efficiency.eng'))} />
        </div>
        <Form
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 22 }}
          size='small'
          form={formShift}
          style={{ width: '70%', marginLeft: 10 }}
          preserve={false}
          colon={false}
        >
          {props.period == 'shift' &&
            <Form.Item label={<ScheduleOutlined style={{ fontSize: '130%', color: '#FFFFFF92' }} />} >
              <span style={{ fontSize: '18px', color: 'white' }}>{t('shift.shift') + ' ' + shift['name']}</span>
            </Form.Item>}
          {props.period == 'day' &&
            <Form.Item label={<HistoryOutlined style={{ fontSize: '130%', color: '#FFFFFF92' }} />} >
              <span style={{ fontSize: '18px', color: 'white' }}>{dayjs().format('LL')}</span>
            </Form.Item>}
          {props.period == 'month' &&
            <Form.Item label={<ReconciliationOutlined style={{ fontSize: '130%', color: '#FFFFFF92' }} />} >
              <span style={{ fontSize: '18px', color: 'white' }}>{dayjs().format('MMMM YYYY')}</span>
            </Form.Item>}
          <Form.Item label={<SyncOutlined style={{ fontSize: '130%', color: '#FFFFFF92' }} />}  >
            <span style={{ fontSize: '18px', color: 'white' }}>{Number(Number(shift['meters']).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.clothMeters.eng')}</span>
          </Form.Item>
          <Form.Item label={<DashboardOutlined style={{ fontSize: '130%', color: '#FFFFFF92' }} />} >
            <span style={{ fontSize: '18px', color: 'white' }}>{Number(Number(shift['rpm']).toFixed(1)).toLocaleString(i18n.language) + ' ' + t('tags.speedMainDrive.eng') + ', ' + Number(Number(shift['mph']).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.speedCloth.eng')}</span>
          </Form.Item>
          {weaver && <Form.Item label={<UserOutlined style={{ fontSize: '130%', color: '#FFFFFF92' }} />} >
            <span style={{ fontSize: '18px', color: 'white' }}>{weaver}</span>
          </Form.Item>}
        </Form>
      </div>
    </Card>
    </>
  );
}
export default Component;
