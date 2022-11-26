import { Badge, Card, Divider, Empty, Form, Modal, Space, Spin } from "antd";
import { useTranslation } from 'react-i18next';
import { ToolOutlined, QuestionCircleOutlined, LoadingOutlined, SyncOutlined, DashboardOutlined, ClockCircleOutlined, RiseOutlined, ScheduleOutlined, UserOutlined, ReconciliationOutlined, HistoryOutlined, PieChartOutlined, ShoppingCartOutlined, PercentageOutlined } from '@ant-design/icons';
import { FabricFullIcon, ButtonIcon, WeftIcon, WarpBeamIcon, FabricPieceLengthIcon, FabricPieceIcon, DensityIcon, SpeedIcon, WarpBeamsIcon } from '@/components/Icons';
import { useEffect, useLayoutEffect, useState } from "react";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
import isBetween from 'dayjs/plugin/isBetween';
import Donut from "./Donut";
dayjs.extend(isBetween);

const Component = (props: any) => {
  const { t, i18n } = useTranslation();
  const [shift, setShift] = useState({ name: '', start: '', end: '', duration: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0, starts: 0, runtime: '', stops: {} })
  const [modeCode, setModeCode] = useState({ val: 0, updated: {} });
  const [tags, setTags] = useState({ data: [] });
  const [weaver, setWeaver] = useState('');
  const [pieces, setPieces] = useState();
  const [lifetime, setLifetime] = useState({ type: '', serialno: '', mfgdate: '', picks: 0, cloth: 0, motor: {} });
  const [shiftDonut, setShiftDonut] = useState([] as any)
  const [shiftDonutSel, setShiftDonutSel] = useState({ run: true, other: true, button: true, warp: true, weft: true, tool: true, fabric: true } as any)

  const [formShift] = Form.useForm();
  let controller1: AbortController | null = null;
  let controller2: AbortController | null = null;
  let controller3: AbortController | null = null;
  let controller4: AbortController | null = null;

  const stopwatch = (start: any) => {
    let diff = dayjs.duration(dayjs().diff(start))
    return (diff.days() > 0 ? diff.days() + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + t('shift.secs') : "")
  }

  const stopObj = (reason: string) => {
    let obj;
    if (reason == 'other') { obj = { color: '#000000FF', text: t('tags.mode.init'), icon: <QuestionCircleOutlined style={{ fontSize: '130%', color: '#000000FF', paddingInline: 5 }} /> } }
    else if (reason == 'button') { obj = { color: '#7339ABFF', text: t('tags.mode.stop'), icon: <ButtonIcon style={{ fontSize: '130%', color: '#7339ABFF', paddingInline: 5 }} /> } }
    else if (reason == 'warp') { obj = { color: '#FF7F27FF', text: t('tags.mode.stop'), icon: <WarpBeamIcon style={{ fontSize: '130%', color: '#FF7F27FF', paddingInline: 5 }} /> } }
    else if (reason == 'weft') { obj = { color: '#FFB300FF', text: t('tags.mode.stop'), icon: <WeftIcon style={{ fontSize: '130%', color: '#FFB300FF', paddingInline: 5 }} /> } }
    else if (reason == 'tool') { obj = { color: '#E53935FF', text: t('tags.mode.stop'), icon: <ToolOutlined style={{ fontSize: '130%', color: '#E53935FF', paddingInline: 5 }} /> } }
    else if (reason == 'fabric') { obj = { color: '#005498FF', text: t('tags.mode.stop'), icon: <FabricFullIcon style={{ fontSize: '130%', color: '#005498FF', paddingInline: 5 }} /> } }
    else { obj = { color: '#00000000', text: t('tags.mode.unknown'), icon: <QuestionCircleOutlined style={{ fontSize: '130%', color: '#00000000', paddingInline: 5 }} /> } }
    return obj;
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

  const cardStyle = { backgroundColor: modeCodeObj(modeCode.val).color, width: '100%', display: 'flex', height: '210px', flexDirection: 'column' as 'column' }
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

  const loomDetail = () => {
    Modal.destroyAll();
    Modal.info({
      title: <span style={{ fontSize: '20px' }}><b>{props.machine.name} </b>{lifetime['type'] && <Divider type="vertical" />}{lifetime['type'] && lifetime['type']}{lifetime['serialno'] && <Divider type="vertical" />}{lifetime['serialno'] && ('№' + lifetime['serialno'])}<Divider type="vertical" />{props.machine.ip}</span>,
      centered: true,
      maskClosable: true,
      width: 600,
      icon: false,
      okText: t('menu.close'),
      content: (
        (modeCode.val > 0) ?
          <Form
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            size='small'
            form={formShift}
            style={{ width: '100%' }}
            preserve={false}
            colon={false}
          >
            <Divider orientation="left"><b>{props.period ? props.period == 'shift' ? t('shift.shift') + ' ' + shift['name'] : props.period == 'month' ? dayjs().format('MMMM YYYY') : dayjs().format('LL') : dayjs().format('LL')}</b></Divider>
            {weaver && <Form.Item label={<UserOutlined style={{ fontSize: '130%', color: '#1890ff' }} />} >
              <span style={{ fontSize: '18px' }}>{weaver}</span>
            </Form.Item>}
            <Form.Item label={<RiseOutlined style={{ color: '#1890ff', fontSize: '130%' }} />}>
              <span style={{ fontSize: '18px' }}>{Number(Number(shift['efficiency']).toFixed(shift['efficiency'] < 10 ? 2 : 1)).toLocaleString(i18n.language) + ' ' + t('tags.efficiency.eng')}</span>
            </Form.Item>
            <Form.Item label={<ClockCircleOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
              <span style={{ fontSize: '18px' }}>{(props.period ? props.period == 'shift' ? dayjs(shift['start']).format('LL LT') : props.period == 'month' ? dayjs().startOf('month').format('LL LT') : dayjs().startOf('day').format('LL LT') : dayjs().startOf('day').format('LL LT')) + ' - ' + (props.period ? props.period == 'shift' ? dayjs(shift['end']).format('LL LT') : dayjs().format('LL LT') : dayjs().format('LL LT')) + (props.period == 'shift' ? (', ' + duration2text(dayjs.duration(shift['duration']))) : '')}</span>
            </Form.Item>
            <Form.Item label={<SyncOutlined style={{ fontSize: '130%', color: '#1890ff' }} />}  >
              <span style={{ fontSize: '18px' }}>{Number(Number(shift['meters']).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.clothMeters.eng')}</span>
            </Form.Item>
            <Form.Item label={<WarpBeamIcon style={{ fontSize: '130%', color: '#1890ff' }} />}  >
              <span style={{ fontSize: '18px' }}>{getTagVal('warpBeamLength') + '/' + getTagVal('fullWarpBeamLength') + ' ' + t('tags.warpBeamLength.eng')}</span>
            </Form.Item>
            <Form.Item label={<DashboardOutlined style={{ fontSize: '130%', color: '#1890ff' }} />} >
              <span style={{ fontSize: '18px' }}>{Number(Number(shift['rpm']).toFixed(1)).toLocaleString(i18n.language) + ' ' + t('tags.speedMainDrive.eng') + ', ' + Number(Number(shift['mph']).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.speedCloth.eng')}</span>
            </Form.Item>
            <Form.Item label={<PieChartOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
              <Space direction="horizontal" style={{ width: '100%', justifyContent: 'start', alignItems: 'start' }} wrap>
                {shift['starts'] > 0 && <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge size='small'
                  count={shift['starts']} overflowCount={999}
                  style={{ backgroundColor: '#52c41aFF' }}
                /><SyncOutlined style={{ fontSize: '130%', color: '#52c41aFF', paddingInline: 5 }} />{duration2text(dayjs.duration(shift['runtime']))}</div>}
                {Array.isArray(shift['stops']) && shift['stops'].map((stop: any) => (
                  stop[Object.keys(stop)[0]]['total'] > 0 && <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge size='small'
                    count={stop[Object.keys(stop)[0]]['total']} overflowCount={999}
                    style={{ backgroundColor: stopObj(Object.keys(stop)[0]).color }}
                  />{stopObj(Object.keys(stop)[0]).icon}{duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']))}</div>))
                }
              </Space>
            </Form.Item>
            <Divider orientation="left"><b>{t('panel.setpoints')}</b></Divider>
            <Form.Item label={<DensityIcon style={{ color: '#1890ff', fontSize: '130%' }} />}>
              <span style={{ fontSize: '18px' }}>{getTagVal('planClothDensity') + ' ' + t('tags.planClothDensity.eng')}</span>
            </Form.Item>
            <Form.Item label={<SpeedIcon style={{ color: '#1890ff', fontSize: '130%' }} />}>
              <span style={{ fontSize: '18px' }}>{getTagVal('planSpeedMainDrive') + ' ' + t('tags.planSpeedMainDrive.eng')}</span>
            </Form.Item>
            <Form.Item label={<PercentageOutlined style={{ color: '#1890ff', fontSize: '130%' }} />}>
              <span style={{ fontSize: '18px' }}>{getTagVal('warpShrinkage') + ' ' + t('tags.warpShrinkage.eng')}</span>
            </Form.Item>
            <Form.Item label={<FabricPieceLengthIcon style={{ color: '#1890ff', fontSize: '130%' }} />}>
              <span style={{ fontSize: '18px' }}>{getTagVal('orderLength') + '/' + getTagVal('planOrderLength') + ' ' + t('tags.orderLength.eng')}</span>
            </Form.Item>
            <Form.Item label={<FabricPieceIcon style={{ color: '#1890ff', fontSize: '130%' }} />}>
              <span style={{ fontSize: '18px' }}>{pieces + '/'}{getTagVal('planOrderLength') != '0' ? Math.floor(localeParseFloat(getTagVal('warpBeamLength')) * (1 - 0.01 * localeParseFloat(getTagVal('warpShrinkage'))) / localeParseFloat(getTagVal('planOrderLength'))) : 0}</span>
            </Form.Item>
            <Divider orientation="left"><b>{t('panel.lifetime')}</b></Divider>
            <Form.Item label={<ShoppingCartOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
              <span style={{ fontSize: '18px' }}>{lifetime['mfgdate'] && dayjs(lifetime['mfgdate']).format("LL")}</span>
            </Form.Item>
            <Form.Item label={<SyncOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
              <span style={{ fontSize: '18px' }}>{lifetime['picks'] > 0 && (lifetime['picks'] + ' ' + t('tags.planClothDensity.eng').split('/')[0])}</span>
            </Form.Item>
            <Form.Item label={<FabricPieceIcon style={{ color: '#1890ff', fontSize: '130%' }} />} >
              <span style={{ fontSize: '18px' }}>{lifetime['cloth'] > 0 && (Number(Number(lifetime['cloth']).toFixed(2).toString()).toLocaleString(i18n.language) + ' ' + t('tags.planClothDensity.eng')?.split('/')[1]?.slice(-1))}</span>
            </Form.Item>
            <Form.Item label={<HistoryOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
              <span style={{ fontSize: '18px' }}>{lifetime['motor'] && duration2text(dayjs.duration(lifetime['motor']))}</span>
            </Form.Item>
          </Form> : <Empty description={false} />
      ),
      onOk() { },
    });
  };
  const fetchShift = async () => {
    try {
      const response = await fetch('http://' + props.machine?.ip + ':3000/shifts/currentshift');
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      setShift({ ...shift, name: json[0]['shiftname'], start: json[0]['shiftstart'], end: json[0]['shiftend'], duration: json[0]['shiftdur'] });
    }
    catch (error) { /*console.log(error);*/ }
  };

  const fetchTags = async (tagNames: string[]) => {
    try {
      const response = await fetch('http://' + props.machine?.ip + ':3000/tags/filter', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ name: tagNames }),
      });
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      else {
        const json = await response.json();
        (json || []).map((tag: any) => (
          tag['val'] = Number(tag['val']).toFixed(tag['tag']['dec']).toString()));
        setTags({ data: json });
        let obj = tags.data.find(o => o['tag']['name'] == 'modeCode')
        obj && setModeCode({ val: Number(obj['val']), updated: dayjs(obj['updated']) })
      }
    }
    catch (error) { /*console.log(error);*/ }
  }

  const fetchStatInfo = async () => {
    controller1 = new AbortController();
    try {
      if (shift.start && shift.end) {
        const response = await fetch('http://' + props.machine?.ip + ':3000/shifts/getstatinfo', {
          signal: controller1.signal,
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ start: props.period ? props.period == 'shift' ? shift.start : props.period == 'month' ? dayjs().startOf('month') : dayjs().startOf('day') : dayjs().startOf('day'), end: new Date() }),
        });
        if (!response.ok) { /*throw Error(response.statusText);*/ }
        const json = await response.json();
        setShift({ ...shift, picks: json[0]['picks'] || 0, meters: json[0]['meters'] || 0, rpm: json[0]['rpm'] || 0, mph: json[0]['mph'] || 0, efficiency: json[0]['efficiency'] || 0, starts: json[0]['starts'] || 0, runtime: json[0]['runtime'] || '', stops: json[0]['stops'] || {} });
      }
    }
    catch (error) { /*console.log(error);*/ }
    controller1 = null;
  };

  const fetchWeaver = async () => {
    controller2 = new AbortController();
    try {
      const ans = await fetch('http://' + props.machine?.ip + ':3000/logs/user', {
        signal: controller2.signal
      });
      if (!ans.ok) { throw Error(ans.statusText); }
      const json = await ans.json();
      setWeaver(json[0] ? json[0].name : '')
    }
    catch (error) { /*console.log(error);*/ }
    controller2 = null;
  }

  const fetchPieces = async () => {
    controller3 = new AbortController();
    try {
      const response = await fetch('http://' + props.machine?.ip + ':3000/logs/getRolls', {
        signal: controller3.signal
      });
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      setPieces(json);
    }
    catch (error) { /*console.log(error);*/ }
    controller3 = null;
  }

  const fetchMachineInfo = async () => {
    controller4 = new AbortController();
    try {
      const response = await fetch('http://' + props.machine?.ip + ':3000/machine', {
        signal: controller4.signal
      });
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      setLifetime(json[0]);
    }
    catch (error) { /*console.log(error);*/ }
    controller4 = null;
  }
  const getTagLink = (tagName: string) => {
    let obj = tags.data.find(o => o['tag']['name'] == tagName)
    if (obj) { return obj['link'] }
    else { return false };
  }

  const getTagVal = (tagName: string): string => {
    let obj = tags.data.find((o: any) => o['tag']['name'] == tagName)
    if (obj) {
      if (tagName == 'warpBeamLength' && modeCode.val == 1) {
        return Number((Number(obj['val']) - (localeParseFloat(getTagVal('picksLastRun')) / (100 * localeParseFloat(getTagVal('planClothDensity')) * (1 - 0.01 * localeParseFloat(getTagVal('warpShrinkage')))))).toFixed(obj['tag']['dec'])).toLocaleString(i18n.language);
      }
      else {
        return Number(obj['val']).toLocaleString(i18n.language);
      }
    }
    else { return '' };
  }

  useLayoutEffect(() => {
    (async () => {
      await fetchTags(['modeCode', 'warpBeamLength', 'picksLastRun', 'planClothDensity', 'warpShrinkage', 'planSpeedMainDrive', 'fullWarpBeamLength', 'orderLength', 'planOrderLength']);
    })();
    return () => { }
  }, [tags])

  useLayoutEffect(() => {
    props.onData({
      loomId: props.machine.id,
      period: props.period == 'shift' ? t('shift.shift') + ' ' + shift['name'] : props.period == 'month' ? dayjs().format('MMMM YYYY') : dayjs().format('LL'),
      starttime: props.period == 'shift' ? dayjs(shift['start']).format('LL LT') : props.period == 'month' ? dayjs().startOf('month').format('LL LT') : dayjs().startOf('day').format('LL LT'),
      endtime: props.period == 'shift' ? dayjs(shift['end']).format('LL LT') : dayjs().format('LL LT'),
      modeCode: modeCode,
      picks: shift.picks,
      meters: shift.meters,
      rpm: shift.rpm,
      mph: shift.mph,
      efficiency: shift.efficiency,
      starts: shift.starts,
      runtime: shift.runtime,
      stops: shift.stops
    });
  }, [modeCode.val, shift.picks, shift.stops, shift.starts, shift.efficiency, props.period])

  useEffect(() => {
    (async () => {
      await fetchShift();
    })();
    return () => { }
  }, [shift.end && dayjs().isAfter(shift.end)])

  useEffect(() => {
    let obj = []
    if (Array.isArray(shift['stops'])) {
      obj.push({ reason: 'run', value: dayjs.duration(shift['runtime']).asMilliseconds(), count: Number(shift['starts']) })
      for (let stop of shift['stops']) {
        obj.push({ reason: Object.keys(stop)[0], value: dayjs.duration(stop[Object.keys(stop)[0]]['dur']).asMilliseconds(), count: stop[Object.keys(stop)[0]]['total'] })
      }
      setShiftDonut(obj);
    }
    return () => { }
  }, [shift.picks, shift.stops, shift.starts, shift.efficiency])

  useEffect(() => {
    (async () => {
      await Promise.all([
        fetchStatInfo(),
        fetchWeaver(),
        fetchPieces(),
        fetchMachineInfo()
      ]);
    })();
    return () => {
      if (controller1) controller1.abort();
      if (controller2) controller2.abort();
      if (controller3) controller3.abort();
      if (controller4) controller4.abort();
    }
  }, [modeCode.val, props.period, (modeCode.val == 1) && (dayjs().second() % 5 == 0)])

  return (
    <>
      <Card onClick={loomDetail} title={<Space direction="horizontal" style={{ width: '100%', justifyContent: 'space-between' }}><b style={{ fontSize: '150%' }}>{props.machine?.name}</b><span style={{ color: '#FFFFFF93', fontSize: '120%' }}>{stopwatch(modeCode.updated)}</span><span style={{ fontSize: '150%' }}>{modeCodeObj(modeCode.val).icon}</span></Space>} loading={!getTagLink('modeCode')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle} >
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
