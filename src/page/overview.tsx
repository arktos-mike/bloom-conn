import { Button, Display, Donut } from '@/components';
import { Alert, Badge, Card, Carousel, Col, Descriptions, Form, Modal, Result, Row, Skeleton, Space } from 'antd';
import { CheckOutlined, ToolOutlined, QuestionCircleOutlined, LoginOutlined, IdcardOutlined, RiseOutlined, PieChartOutlined, SyncOutlined, ClockCircleOutlined, ScheduleOutlined, DashboardOutlined, AimOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { FabricFullIcon, ButtonIcon, WeftIcon, FabricPieceIcon, FabricPieceLengthIcon, WarpBeamIcon, WarpBeamsIcon } from '@/components/Icons';

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as 'column' }

type Props = {

};

const Overview: React.FC<Props> = ({

}) => {
  const [formShift] = Form.useForm();
  const [formWeaver] = Form.useForm();
  const { t, i18n } = useTranslation();
  const [height, setHeight] = useState<number | undefined>(0)
  const [tags, setTags] = useState({ data: [] as any })
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState()
  const [pieces, setPieces] = useState()
  const [userDonut, setUserDonut] = useState([] as any)
  const [userDonutSel, setUserDonutSel] = useState({ run: true, other: true, button: true, warp: true, weft: true, tool: true, fabric: true } as any)
  const [shiftDonut, setShiftDonut] = useState([] as any)
  const [shiftDonutSel, setShiftDonutSel] = useState({ run: true, other: false, button: false, warp: true, weft: true, tool: true, fabric: false } as any)
  const div = useRef<HTMLDivElement | null>(null);
  const contentStyle = { height: height, margin: '1px' };
  let isSubscribed = true;

  const duration2text = (diff: any) => {
    if (diff == null) return null
    return (diff.days() > 0 ? diff.days() + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + t('shift.secs') : "")
  }

  const stopObj = (reason: string, enable: boolean) => {
    let obj;
    if (reason == 'other') { obj = { color: enable ? '#000000FF' : '#8c8c8c', text: t('tags.mode.init'), icon: <QuestionCircleOutlined style={{ fontSize: '130%', color: enable ? '#000000FF' : '#8c8c8c', paddingInline: 5 }} /> } }
    else if (reason == 'button') { obj = { color: enable ? '#7339ABFF' : '#8c8c8c', text: t('tags.mode.stop'), icon: <ButtonIcon style={{ fontSize: '130%', color: enable ? '#7339ABFF' : '#8c8c8c', paddingInline: 5 }} /> } }
    else if (reason == 'warp') { obj = { color: enable ? '#FF7F27FF' : '#8c8c8c', text: t('tags.mode.stop'), icon: <WarpBeamIcon style={{ fontSize: '130%', color: enable ? '#FF7F27FF' : '#8c8c8c', paddingInline: 5 }} /> } }
    else if (reason == 'weft') { obj = { color: enable ? '#FFB300FF' : '#8c8c8c', text: t('tags.mode.stop'), icon: <WeftIcon style={{ fontSize: '130%', color: enable ? '#FFB300FF' : '#8c8c8c', paddingInline: 5 }} /> } }
    else if (reason == 'tool') { obj = { color: enable ? '#E53935FF' : '#8c8c8c', text: t('tags.mode.stop'), icon: <ToolOutlined style={{ fontSize: '130%', color: enable ? '#E53935FF' : '#8c8c8c', paddingInline: 5 }} /> } }
    else if (reason == 'fabric') { obj = { color: enable ? '#005498FF' : '#8c8c8c', text: t('tags.mode.stop'), icon: <FabricFullIcon style={{ fontSize: '130%', color: enable ? '#005498FF' : '#8c8c8c', paddingInline: 5 }} /> } }
    else { obj = { color: enable ? '#00000000' : '#8c8c8c', text: t('tags.mode.unknown'), icon: <QuestionCircleOutlined style={{ fontSize: '130%', color: enable ? '#00000000' : '#8c8c8c', paddingInline: 5 }} /> } }
    return obj;
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

  useEffect(() => {
    return () => { isSubscribed = false }
  }, [tags])

  useEffect(() => {
    setHeight(div.current?.offsetHeight ? div.current?.offsetHeight : 0)
  }, [])

  useEffect(() => {
    dayjs.locale(i18n.language)
  }, [i18n.language])


  return (
    <div ref={div} className='wrapper'>
      <Carousel dotPosition='top' swipe={true}>
        <div>
          <div style={contentStyle}>
            <div className='wrapper'>

            </div></div></div>
        <div>
          <div style={{ ...contentStyle, maxHeight: '100%', overflowY: 'auto' }}>
            <div >
              <Skeleton loading={loading} round active>

              </Skeleton>
            </div>
          </div>
        </div>
      </Carousel >
    </div >
  )
}

export default Overview
