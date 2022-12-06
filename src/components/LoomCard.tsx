import { Badge, Card, Divider, Empty, Form, Modal, Space } from "antd";
import { useTranslation } from 'react-i18next';
import { ToolOutlined, QuestionCircleOutlined, LoadingOutlined, SyncOutlined, DashboardOutlined, ClockCircleOutlined, RiseOutlined, ScheduleOutlined, UserOutlined, ReconciliationOutlined, HistoryOutlined, PieChartOutlined, ShoppingCartOutlined, PercentageOutlined } from '@ant-design/icons';
import { FabricFullIcon, ButtonIcon, WeftIcon, WarpBeamIcon, FabricPieceLengthIcon, FabricPieceIcon, DensityIcon, SpeedIcon } from '@/components/Icons';
import { memo, useEffect, useState } from "react";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
import isBetween from 'dayjs/plugin/isBetween';
import Donut from "./Donut";
import { isEqual } from "lodash";
dayjs.extend(isBetween);

const Component = memo((props: any) => {
  const { t, i18n } = useTranslation();
  const [modeCode, setModeCode] = useState<any>();
  const [tags, setTags] = useState<any[]>([])
  const [link, setLink] = useState(false)
  const [info, setInfo] = useState({
    tags: [],
    shift: { shiftname: '', shiftstart: '', shiftend: '', shiftdur: '' },
    weaver: { id: '', name: '', logintime: '' },
    userinfo: { picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0 },
    shiftinfo: { start: '', end: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0 } || null,
    dayinfo: { start: '', end: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0 },
    monthinfo: { start: '', end: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0 }
  })
  const [fullinfo, setFullInfo] = useState({
    tags: [],
    rolls: '',
    shift: { shiftname: '', shiftstart: '', shiftend: '', shiftdur: '' },
    lifetime: { type: '', serialno: '', mfgdate: '', picks: 0, cloth: 0, motor: '' },
    weaver: { id: '', name: '', logintime: '' },
    userinfo: { workdur: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0, starts: 0, runtime: { milliseconds: 0, seconds: 0, minutes: 0, hours: 0, days: 0, weeks: 0, months: 0, years: 0 }, stops: {} },
    shiftinfo: { start: '', end: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0, starts: 0, runtime: { milliseconds: 0, seconds: 0, minutes: 0, hours: 0, days: 0, weeks: 0, months: 0, years: 0 }, stops: {} } || null,
    dayinfo: { start: '', end: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0, starts: 0, runtime: { milliseconds: 0, seconds: 0, minutes: 0, hours: 0, days: 0, weeks: 0, months: 0, years: 0 }, stops: {} },
    monthinfo: { start: '', end: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0, starts: 0, runtime: { milliseconds: 0, seconds: 0, minutes: 0, hours: 0, days: 0, weeks: 0, months: 0, years: 0 }, stops: {} }
  })
  const [periodInfo, setPeriodInfo] = useState<any>((props.period == 'day' || ((!fullinfo?.shift?.shiftstart || !fullinfo?.shift?.shiftend) && props.period == 'shift')) ? { name: dayjs(fullinfo?.dayinfo?.start).format('LL'), start: fullinfo?.dayinfo?.start, end: fullinfo?.dayinfo?.end, duration: '', picks: fullinfo?.dayinfo?.picks, meters: fullinfo?.dayinfo?.meters, rpm: fullinfo?.dayinfo?.rpm, mph: fullinfo?.dayinfo?.mph, efficiency: fullinfo?.dayinfo?.efficiency, starts: fullinfo?.dayinfo?.starts, runtime: fullinfo?.dayinfo?.runtime, stops: fullinfo?.dayinfo?.stops } : (props.period == 'shift') ? { name: t('shift.shift') + ' ' + fullinfo?.shift?.shiftname, start: fullinfo?.shift?.shiftstart, end: fullinfo?.shift?.shiftend, duration: fullinfo?.shift?.shiftdur, picks: fullinfo?.shiftinfo?.picks, meters: fullinfo?.shiftinfo?.meters, rpm: fullinfo?.shiftinfo?.rpm, mph: fullinfo?.shiftinfo?.mph, efficiency: fullinfo?.shiftinfo?.efficiency, starts: fullinfo?.shiftinfo?.starts, runtime: fullinfo?.shiftinfo?.runtime, stops: fullinfo?.shiftinfo?.stops } : (props.period == 'month') ? { name: dayjs(fullinfo?.monthinfo?.start).format('MMMM YYYY'), start: fullinfo?.monthinfo?.start, end: fullinfo?.monthinfo?.end, duration: '', picks: fullinfo?.monthinfo?.picks, meters: fullinfo?.monthinfo?.meters, rpm: fullinfo?.monthinfo?.rpm, mph: fullinfo?.monthinfo?.mph, efficiency: fullinfo?.monthinfo?.efficiency, starts: fullinfo?.monthinfo?.starts, runtime: fullinfo?.monthinfo?.runtime, stops: fullinfo?.monthinfo?.stops } : {})
  const [shiftDonut, setShiftDonut] = useState([] as any)
  const [shiftDonutSel, setShiftDonutSel] = useState({ run: true, other: true, button: true, warp: true, weft: true, tool: true, fabric: true } as any)

  const [formShift] = Form.useForm();

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

  const stopNum = (reason: string) => {
    let obj;
    if (reason == 'other') obj = 0
    else if (reason == 'button') obj = 2
    else if (reason == 'warp') obj = 3
    else if (reason == 'weft') obj = 4
    else if (reason == 'tool') obj = 5
    else if (reason == 'fabric') obj = 6
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
    else { obj = { color: '#000000FF', text: t('tags.mode.unknown'), icon: <QuestionCircleOutlined style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    return obj;
  }

  const cardStyle = { backgroundColor: modeCodeObj(modeCode?.val).color, width: '100%', display: 'flex', height: '210px', flexDirection: 'column' as 'column' }
  const cardHeadStyle = { background: modeCodeObj(modeCode?.val).color, color: "white" }
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
      title: <span style={{ fontSize: '20px' }}><b>{props.machine.name} </b>{fullinfo?.lifetime?.type && <Divider type="vertical" />}{fullinfo?.lifetime?.type && fullinfo?.lifetime?.type}{fullinfo?.lifetime?.serialno && <Divider type="vertical" />}{fullinfo?.lifetime?.serialno && ('№' + fullinfo?.lifetime?.serialno)}<Divider type="vertical" />{props.machine.ip}</span>,
      centered: true,
      maskClosable: true,
      width: 600,
      icon: false,
      okText: t('menu.close'),
      content: (
        (modeCode?.val > 0) ?
          <Form
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            size='small'
            form={formShift}
            style={{ width: '100%' }}
            preserve={false}
            colon={false}
          >
            <Divider orientation="left"><b>{periodInfo?.name}</b></Divider>
            <Form.Item label={<RiseOutlined style={{ color: '#1890ff', fontSize: '130%' }} />}>
              <span style={{ fontSize: '18px' }}>{Number(Number(periodInfo?.efficiency).toFixed(periodInfo?.efficiency < 10 ? 2 : 1)).toLocaleString(i18n.language) + ' ' + t('tags.efficiency.eng')}</span>
            </Form.Item>
            <Form.Item label={<ClockCircleOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
              <span style={{ fontSize: '18px' }}>{dayjs(periodInfo?.start).format('LL LT') + ' - ' + dayjs(periodInfo?.end).format('LL LT') + (periodInfo?.duration && (', ' + duration2text(dayjs.duration(periodInfo?.duration))))}</span>
            </Form.Item>
            <Form.Item label={<SyncOutlined style={{ fontSize: '130%', color: '#1890ff' }} />}  >
              <span style={{ fontSize: '18px' }}>{Number(periodInfo?.picks) + ' ' + t('tags.picksLastRun.eng') + ', ' + Number(Number(periodInfo?.meters).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.clothMeters.eng')}</span>
            </Form.Item>
            <Form.Item label={<WarpBeamIcon style={{ fontSize: '130%', color: '#1890ff' }} />}  >
              <span style={{ fontSize: '18px' }}>{getTagVal('warpBeamLength') + '/' + getTagVal('fullWarpBeamLength') + ' ' + t('tags.warpBeamLength.eng')}</span>
            </Form.Item>
            <Form.Item label={<DashboardOutlined style={{ fontSize: '130%', color: '#1890ff' }} />} >
              <span style={{ fontSize: '18px' }}>{Number(Number(periodInfo?.rpm).toFixed(1)).toLocaleString(i18n.language) + ' ' + t('tags.speedMainDrive.eng') + ', ' + Number(Number(periodInfo?.mph).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.speedCloth.eng')}</span>
            </Form.Item>
            <Form.Item label={<PieChartOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
              <Space direction="horizontal" style={{ width: '100%', justifyContent: 'start', alignItems: 'start' }} wrap>
                {periodInfo?.starts > 0 && <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge size='small'
                  count={periodInfo?.starts} overflowCount={999}
                  style={{ backgroundColor: '#52c41aFF' }}
                /><SyncOutlined style={{ fontSize: '130%', color: '#52c41aFF', paddingInline: 5 }} />{modeCode?.val == 1 ? duration2text(dayjs.duration(periodInfo?.runtime).add(dayjs().diff(modeCode?.updated))) : duration2text(dayjs.duration(periodInfo?.runtime))}</div>}
                {Array.isArray(periodInfo?.stops) && periodInfo?.stops.map((stop: any) => (
                  stop[Object.keys(stop)[0]]['total'] > 0 && <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge size='small'
                    count={stop[Object.keys(stop)[0]]['total']} overflowCount={999}
                    style={{ backgroundColor: stopObj(Object.keys(stop)[0]).color }}
                  />{stopObj(Object.keys(stop)[0]).icon}{modeCode?.val == stopNum(Object.keys(stop)[0]) ? duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']).add(dayjs().diff(modeCode?.updated))) : duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']))}</div>))
                }
              </Space>
            </Form.Item>
            {fullinfo?.weaver?.name && <Form.Item label={<UserOutlined style={{ fontSize: '130%', color: '#1890ff' }} />} >
              <span style={{ fontSize: '18px' }}>{fullinfo?.weaver?.name}</span>
            </Form.Item>}
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
              <span style={{ fontSize: '18px' }}>{fullinfo?.rolls + '/'}{getTagVal('planOrderLength') != '0' ? Math.floor(localeParseFloat(getTagVal('warpBeamLength')) * (1 - 0.01 * localeParseFloat(getTagVal('warpShrinkage'))) / localeParseFloat(getTagVal('planOrderLength'))) : 0}</span>
            </Form.Item>
            <Divider orientation="left"><b>{t('panel.lifetime')}</b></Divider>
            <Form.Item label={<ShoppingCartOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
              <span style={{ fontSize: '18px' }}>{fullinfo?.lifetime?.mfgdate && dayjs(fullinfo?.lifetime?.mfgdate).format("LL")}</span>
            </Form.Item>
            <Form.Item label={<SyncOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
              <span style={{ fontSize: '18px' }}>{fullinfo?.lifetime?.picks > 0 && ((fullinfo?.lifetime?.picks + ((modeCode?.val == 1) ? Number(getTagVal('picksLastRun')) : 0)) + ' ' + t('tags.planClothDensity.eng').split('/')[0])}</span>
            </Form.Item>
            <Form.Item label={<FabricPieceIcon style={{ color: '#1890ff', fontSize: '130%' }} />} >
              <span style={{ fontSize: '18px' }}>{fullinfo?.lifetime?.cloth > 0 && (Number(Number((modeCode?.val == 1) ? fullinfo?.lifetime?.cloth + Number(getTagVal('picksLastRun')) / (100 * Number(getTagVal('planClothDensity'))) : fullinfo?.lifetime?.cloth).toFixed(2).toString()).toLocaleString(i18n.language) + ' ' + t('tags.planClothDensity.eng')?.split('/')[1]?.slice(-1))}</span>
            </Form.Item>
            <Form.Item label={<HistoryOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
              <span style={{ fontSize: '18px' }}>{duration2text((modeCode?.val == 1) ? dayjs.duration(fullinfo?.lifetime?.motor).add(dayjs().diff(modeCode?.updated)) : dayjs.duration(fullinfo?.lifetime?.motor))}</span>
            </Form.Item>
          </Form> : <Empty description={false} />
      ),
      onOk() { },
    });
  };

  const fetchAll = async () => {
    try {
      const response = await fetch('http://localhost:3000/tags/full');
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      setFullInfo(json);
    }
    catch (error) { /*console.log(error);*/ }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('http://' + props.machine?.ip + ':3000/tags');
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      setTags(json);
      let obj = json.find((o: any) => o['tag']['name'] == 'modeCode')
      obj && setModeCode({ val: obj['val'], updated: dayjs(obj['updated']) })
      obj && setLink(obj['link']);
    }
    catch (error) { /*console.log(error);*/ }
  }

  const getTagVal = (tagName: string): string => {
    let obj = tags.find((o: any) => o['tag']['name'] == tagName)
    if (obj) {
      if (tagName == 'warpBeamLength' && modeCode?.val == 1) {
        return Number((Number(obj['val']) - (localeParseFloat(getTagVal('picksLastRun')) / (100 * localeParseFloat(getTagVal('planClothDensity')) * (1 - 0.01 * localeParseFloat(getTagVal('warpShrinkage')))))).toFixed(obj['tag']['dec'])).toLocaleString(i18n.language);
      }
      else {
        return Number(obj['val']).toLocaleString(i18n.language);
      }
    }
    else { return '' };
  }

  useEffect(() => {
    (async () => {
      await Promise.all([
        fetchTags(),
        fetchAll()
      ]);
    })();
    return () => { }
  }, [])

  useEffect(() => {

    return () => { }
  }, [!link])

  useEffect(() => {
    (async () => {
      if (!link) setModeCode({ val: 0, updated: dayjs() })
      else {
        await Promise.all([
          fetchTags(),
          fetchAll()
        ]);
      }
    })();
    return () => { }
  }, [link])

  useEffect(() => {
    if (Array.isArray(periodInfo?.stops)) {
      let obj = []
      obj.push({ reason: 'run', value: dayjs.duration(periodInfo?.runtime || 0).asMilliseconds(), count: Number(periodInfo?.starts) })
      for (let stop of periodInfo?.stops) {
        obj.push({ reason: Object.keys(stop)[0], value: dayjs.duration(stop[Object.keys(stop)[0]]['dur']).asMilliseconds(), count: stop[Object.keys(stop)[0]]['total'] })
      }
      setShiftDonut(obj);
    }
    return () => { }
  }, [periodInfo?.runtime, periodInfo?.stops, props.period])

  useEffect(() => {
    if (props.period == 'day' || ((!fullinfo?.shift?.shiftstart || !fullinfo?.shift?.shiftend) && props.period == 'shift')) setPeriodInfo({ name: dayjs(fullinfo?.dayinfo?.start).format('LL'), start: fullinfo?.dayinfo?.start, end: fullinfo?.dayinfo?.end, duration: '', picks: fullinfo?.dayinfo?.picks, meters: fullinfo?.dayinfo?.meters, rpm: fullinfo?.dayinfo?.rpm, mph: fullinfo?.dayinfo?.mph, efficiency: fullinfo?.dayinfo?.efficiency, starts: fullinfo?.dayinfo?.starts, runtime: fullinfo?.dayinfo?.runtime, stops: fullinfo?.dayinfo?.stops });
    else if (props.period == 'shift') setPeriodInfo({ name: t('shift.shift') + ' ' + fullinfo?.shift?.shiftname, start: fullinfo?.shift?.shiftstart, end: fullinfo?.shift?.shiftend, duration: fullinfo?.shift?.shiftdur, picks: fullinfo?.shiftinfo?.picks, meters: fullinfo?.shiftinfo?.meters, rpm: fullinfo?.shiftinfo?.rpm, mph: fullinfo?.shiftinfo?.mph, efficiency: fullinfo?.shiftinfo?.efficiency, starts: fullinfo?.shiftinfo?.starts, runtime: fullinfo?.shiftinfo?.runtime, stops: fullinfo?.shiftinfo?.stops });
    else if (props.period == 'month') setPeriodInfo({ name: dayjs(fullinfo?.monthinfo?.start).format('MMMM YYYY'), start: fullinfo?.monthinfo?.start, end: fullinfo?.monthinfo?.end, duration: '', picks: fullinfo?.monthinfo?.picks, meters: fullinfo?.monthinfo?.meters, rpm: fullinfo?.monthinfo?.rpm, mph: fullinfo?.monthinfo?.mph, efficiency: fullinfo?.monthinfo?.efficiency, starts: fullinfo?.monthinfo?.starts, runtime: fullinfo?.monthinfo?.runtime, stops: fullinfo?.monthinfo?.stops });
  }, [fullinfo, props.period]);

  useEffect(() => {
    if (props.period == 'day' || ((!info.shift.shiftstart || !info.shift.shiftend) && props.period == 'shift')) setPeriodInfo({ ...periodInfo, name: dayjs(info.dayinfo?.start).format('LL'), start: info.dayinfo?.start, end: info.dayinfo?.end, picks: info.dayinfo?.picks, meters: info.dayinfo?.meters, rpm: info.dayinfo?.rpm, mph: info.dayinfo?.mph, efficiency: info.dayinfo?.efficiency });
    else if (props.period == 'shift') setPeriodInfo({ ...periodInfo, name: t('shift.shift') + ' ' + info.shift?.shiftname, start: info.shift?.shiftstart, end: info.shift?.shiftend, picks: info.shiftinfo?.picks, meters: info.shiftinfo?.meters, rpm: info.shiftinfo?.rpm, mph: info.shiftinfo?.mph, efficiency: info.shiftinfo?.efficiency });
    else if (props.period == 'month') setPeriodInfo({ ...periodInfo, name: dayjs(info.monthinfo?.start).format('MMMM YYYY'), start: info.monthinfo?.start, end: info.monthinfo?.end, picks: info.monthinfo?.picks, meters: info.monthinfo?.meters, rpm: info.monthinfo?.rpm, mph: info.monthinfo?.mph, efficiency: info.monthinfo?.efficiency });
  }, [info.dayinfo?.end]);

  useEffect(() => {
    props.onData({
      loomId: props.machine.id,
      period: periodInfo?.name,
      starttime: dayjs(periodInfo?.start).format('LL LT'),
      endtime: dayjs(periodInfo?.end).format('LL LT'),
      modeCode: modeCode,
      picks: periodInfo?.picks,
      meters: periodInfo?.meters,
      rpm: periodInfo?.rpm,
      mph: periodInfo?.mph,
      efficiency: periodInfo?.efficiency,
      starts: periodInfo?.starts,
      runtime: periodInfo?.runtime,
      stops: periodInfo?.stops
    });
  }, [modeCode?.val, periodInfo?.picks, periodInfo?.stops, periodInfo?.starts, periodInfo?.efficiency, props.period])

  useEffect(() => {
    const source = new EventSource('http://' + props.machine?.ip + ':3000/tags/events');

    source.addEventListener('tags', (e) => {
      const json = JSON.parse(e.data);
      if (tags.length > 0) {
        const updatedTags = tags.map(obj => json.find((o: any) => o['tag']!['name'] === obj['tag']['name']) || obj);
        setTags(updatedTags);
      }
      if (e.lastEventId == 'modeCode') {
        setModeCode({ val: json[0]['val'], updated: dayjs(json[0]['updated']) })
        setLink(json[0]['link']);
      }
    });

    source.addEventListener('fullinfo', (e) => {
      const json = JSON.parse(e.data);
      setFullInfo(json);
      if (tags.length > 0) {
        const updatedTags = tags.map(obj => json.tags.find((o: any) => o['tag']!['name'] === obj['tag']['name']) || obj);
        setTags(updatedTags);
      }

    });

    source.addEventListener('info', (e) => {
      const json = JSON.parse(e.data);
      setInfo(json);
      if (tags.length > 0) {
        const updatedTags = tags.map(obj => json.tags.find((o: any) => o['tag']!['name'] === obj['tag']['name']) || obj);
        setTags(updatedTags);
        setLink(json.tags[0]['link']);
      }
    });

    source.addEventListener('rolls', (e) => {
      setFullInfo({ ...fullinfo, rolls: JSON.parse(e.data) });
    });

    source.addEventListener('error', (e) => {
      //console.error('Error: ',  e);
      setLink(false);
    });
    return () => {
      source.close();
    };
  }, []);

  return (
    <>
      <Card onClick={loomDetail} title={<Space direction="horizontal" style={{ width: '100%', justifyContent: 'space-between' }}><b style={{ fontSize: '150%' }}>{props.machine?.name}</b><span style={{ color: '#FFFFFF93', fontSize: '120%' }}>{stopwatch(modeCode?.updated)}</span><span style={{ fontSize: '150%' }}>{modeCodeObj(modeCode?.val).icon}</span></Space>} loading={!link} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle} >
        <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '30%', height: '112px' }}>
            <Donut data={shiftDonut} selected={shiftDonutSel} text={(Number(Number(periodInfo?.efficiency).toFixed(periodInfo?.efficiency < 10 ? 2 : 1)).toLocaleString(i18n.language) + t('tags.efficiency.eng'))} />
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
            <Form.Item label={<ScheduleOutlined style={{ fontSize: '130%', color: '#FFFFFF92' }} />} >
              <span style={{ fontSize: '18px', color: 'white' }}>{periodInfo?.name}</span>
            </Form.Item>
            <Form.Item label={<SyncOutlined style={{ fontSize: '130%', color: '#FFFFFF92' }} />}  >
              <span style={{ fontSize: '18px', color: 'white' }}>{Number(Number(periodInfo?.meters).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.clothMeters.eng')}</span>
            </Form.Item>
            <Form.Item label={<DashboardOutlined style={{ fontSize: '130%', color: '#FFFFFF92' }} />} >
              <span style={{ fontSize: '18px', color: 'white' }}>{Number(Number(periodInfo?.rpm).toFixed(1)).toLocaleString(i18n.language) + ' ' + t('tags.speedMainDrive.eng') + ', ' + Number(Number(periodInfo?.mph).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.speedCloth.eng')}</span>
            </Form.Item>

            {fullinfo?.weaver?.name && <Form.Item label={<UserOutlined style={{ fontSize: '130%', color: '#FFFFFF92' }} />} >
              <span style={{ fontSize: '18px', color: 'white' }}>{fullinfo?.weaver?.name}</span>
            </Form.Item>}
          </Form>
        </div>
      </Card>
    </>
  );
},
  (pre, next) => {
    return isEqual(pre?.period, next?.period);
  }
);
export default Component;
