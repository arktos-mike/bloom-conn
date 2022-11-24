import { LoomCard } from '@/components';
import { Badge, Carousel, List, Segmented, Skeleton, Space, Table, Tabs } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { ScheduleOutlined, AppstoreOutlined, ReconciliationOutlined, HistoryOutlined, MinusCircleTwoTone, PlusCircleTwoTone, QuestionCircleOutlined, ToolOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import { ButtonIcon, FabricFullIcon, WarpBeamIcon, WeftIcon } from '@/components/Icons';

const Store = require('electron-store');
const store = new Store();

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as 'column' }

type Props = {

};

const Overview: React.FC<Props> = ({

}) => {

  const { t, i18n } = useTranslation();
  const [height, setHeight] = useState<number | undefined>(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<DataType[]>([])
  const [groups, setGroups] = useState()
  const [machines, setMachines] = useState()
  const [period, setPeriod] = useState('shift')
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<DataType>>({});

  const div = useRef<HTMLDivElement | null>(null);
  const contentStyle = { height: height, margin: '1px' };
  let isSubscribed = true;

  const handleLoomData = (record: DataType) => {
    //console.log(record)
    const newData = [...data];
    const index = newData.findIndex(item => record.loomId === item.loomId);
    if (index != -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...record,
      });
      setData(newData);
    }
    else { setData([...data, record]) }
  }

  const items = (groups || []).map(group => {
    return {
      label: <><AppstoreOutlined />{group['name']}</>, key: group['id'],
      children:
        <div style={{ height: height && height - 35, maxHeight: '100%', width: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 4,
              lg: 4,
              xl: 4,
              xxl: 4,
            }}
            dataSource={(machines || []).filter(item => item['groupId'] == group['id'])}
            renderItem={(item) => (
              <List.Item>
                <LoomCard machine={item} period={period} onData={handleLoomData} />
              </List.Item>
            )}
          />
        </div>
    }
  })

  useEffect(() => {
    setHeight(div.current?.offsetHeight ? div.current?.offsetHeight : 0)
    setGroups(store.get('groups'))
    setMachines(store.get('machines'))
  }, [])

  useEffect(() => {
    dayjs.locale(i18n.language)
  }, [i18n.language])

  const stopObj = (reason: string) => {
    let obj;
    if (reason == 'other') { obj = { color: '#000000FF', text: t('tags.mode.init'), icon: <QuestionCircleOutlined style={{ fontSize: '175%', color: '#000000FF', paddingInline: 5 }} /> } }
    else if (reason == 'button') { obj = { color: '#7339ABFF', text: t('tags.mode.stop'), icon: <ButtonIcon style={{ fontSize: '175%', color: '#7339ABFF', paddingInline: 5 }} /> } }
    else if (reason == 'warp') { obj = { color: '#FF7F27FF', text: t('tags.mode.stop'), icon: <WarpBeamIcon style={{ fontSize: '175%', color: '#FF7F27FF', paddingInline: 5 }} /> } }
    else if (reason == 'weft') { obj = { color: '#FFB300FF', text: t('tags.mode.stop'), icon: <WeftIcon style={{ fontSize: '175%', color: '#FFB300FF', paddingInline: 5 }} /> } }
    else if (reason == 'tool') { obj = { color: '#E53935FF', text: t('tags.mode.stop'), icon: <ToolOutlined style={{ fontSize: '175%', color: '#E53935FF', paddingInline: 5 }} /> } }
    else if (reason == 'fabric') { obj = { color: '#005498FF', text: t('tags.mode.stop'), icon: <FabricFullIcon style={{ fontSize: '175%', color: '#005498FF', paddingInline: 5 }} /> } }
    else { obj = { color: '#00000000', text: t('tags.mode.unknown'), icon: <QuestionCircleOutlined style={{ fontSize: '175%', color: '#00000000', paddingInline: 5 }} /> } }
    return obj;
  }

  const duration2text = (diff: any) => {
    if (diff == null) return null
    return (diff.days() > 0 ? diff.days() + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + t('shift.secs') : "")
  }

  const stopsAgg = (stops: any) => {

    let dur = dayjs.duration(0)
    let total = 0;
    (stops||[]).map((part: any) => {
      if (part[Object.keys(part)[0]].dur != null) {
        dur = dur.add(part[Object.keys(part)[0]].dur)
        total = total + part[Object.keys(part)[0]].total
      }
    })
    return Object.assign({ dur: dur, total: total })
  }

  const handleChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, currentDataSource) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<DataType>);
  };

  interface DataType {
    loomId: any;
    period: any;
    starttime: any;
    endtime: any;
    modeCode: number;
    picks: number;
    meters: number;
    rpm: number;
    mph: number;
    efficiency: number;
    starts: number;
    runtime: any;
    stops: any;
  }

  const columns: ColumnsType<DataType> = [
    {
      title: t('machine.self'),
      dataIndex: 'loomId',
      key: 'loomId',
      ellipsis: true,
      width: '5%',
      render: (_, record) => <><b>{(machines || []).filter((item: any) => item.id == record.loomId)[0]['name']}</b><br />{stopObj(record.modeCode.toString()).icon}</>
    },
    {
      title: t('report.date'),
      dataIndex: 'starttime',
      key: 'starttime',
      ellipsis: true,
      width: '16%',
      render: (_, record) => <><b>{record.period}</b><br />{record.starttime}<br />{record.endtime}</>
    },
    {
      title: t('tags.picks.descr'),
      dataIndex: 'picks',
      key: 'picks',
      sorter: (a, b) => a.picks - b.picks,
      sortOrder: sortedInfo.columnKey === 'picks' ? sortedInfo.order : null,
      ellipsis: true,
      width: '10%',
      render: (_, record) => record.picks,
    },
    {
      title: t('tags.clothMeters.descr'),
      dataIndex: 'meters',
      key: 'meters',
      ellipsis: true,
      width: '8%',
      render: (_, record) => record?.meters && (Number(record?.meters).toFixed(2) + " " + t('tags.clothMeters.eng'))
    },
    {
      title: t('tags.speedMainDrive.descr'),
      dataIndex: 'rpm',
      key: 'rpm',
      ellipsis: true,
      width: '10%',
      render: (_, record) => record?.rpm && (Number(record?.rpm).toFixed(1) + " " + t('tags.speedMainDrive.eng'))
    },
    {
      title: t('tags.speedCloth.descr'),
      dataIndex: 'mph',
      key: 'mph',
      ellipsis: true,
      width: '8%',
      render: (_, record) => record?.mph && (Number(record?.mph).toFixed(2) + " " + t('tags.speedCloth.eng'))
    },
    {
      title: t('tags.efficiency.descr'),
      dataIndex: 'efficiency',
      key: 'efficiency',
      sorter: (a, b) => Number(a.efficiency) - Number(b.efficiency),
      sortOrder: sortedInfo.columnKey === 'efficiency' ? sortedInfo.order : null,
      ellipsis: true,
      width: '10%',
      render: (_, record) => <b>{record?.efficiency && (Number(record?.efficiency).toFixed(2) + " %")}</b>
    },
    {
      title: t('report.starts'),
      dataIndex: 'starts',
      key: 'starts',
      ellipsis: true,
      render: (_, record) => <div><Badge
        count={record.starts} overflowCount={999}
        style={{ backgroundColor: '#52c41a' }}
      /> {record?.runtime && duration2text(dayjs.duration(record?.runtime))}</div>
    },
    Table.EXPAND_COLUMN,
    {
      title: t('report.stops'),
      dataIndex: 'stops',
      key: 'stops',
      ellipsis: true,
      render: (_, record) => <div><Badge
        count={stopsAgg(record?.stops).total} overflowCount={999}
        style={{ backgroundColor: '#1890ff' }}
      /> {duration2text(stopsAgg(record?.stops).dur)}</div>
    },
  ];

  return (
    <div ref={div} className='wrapper'>
      <Carousel dotPosition='top' swipe={true}>
        <div>
          <div style={contentStyle}>
            <div className='wrapper'>
              <Tabs size='small' type='card' animated={{ inkBar: true, tabPane: true }} items={items} tabBarExtraContent={{
                right:
                  <Segmented size='large' value={period} onChange={(value) => { setPeriod(value.toString()); }}
                    options={[{ label: t('period.shift'), value: 'shift', icon: <ScheduleOutlined /> },
                    { label: t('period.day'), value: 'day', icon: <HistoryOutlined /> },
                    { label: t('period.month'), value: 'month', icon: <ReconciliationOutlined /> }]} />
              }} />
            </div></div></div>
        <div>
          <div style={{ ...contentStyle, maxHeight: '100%', overflowY: 'auto' }}>
            <div >
              <Skeleton loading={loading} round active>
                <Table
                  columns={columns}
                  dataSource={data.filter(item=>item.modeCode>0)}
                  pagination={false}
                  scroll={{ x: '100%', y: height ? height - 175 : 0 }}
                  expandable={{
                    expandedRowRender: record => <Space direction="horizontal" style={{ width: '100%', justifyContent: 'space-evenly' }}>
                      {record?.stops.map((stop: any) => (
                        stop[Object.keys(stop)[0]]['total'] > 0 && <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge
                          count={stop[Object.keys(stop)[0]]['total']} overflowCount={999}
                          style={{ backgroundColor: stopObj(Object.keys(stop)[0]).color, marginRight: '3px' }}
                        />{stopObj(Object.keys(stop)[0]).icon}{duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']))}</div>))
                      }
                    </Space>,
                    rowExpandable: record => stopsAgg(record?.stops).total > 0,
                    expandIcon: ({ expanded, onExpand, record }) =>
                      stopsAgg(record?.stops).total == 0 ? null : expanded ? (
                        <MinusCircleTwoTone style={{ fontSize: '150%' }} onClick={e => onExpand(record, e)} />
                      ) : (
                        <PlusCircleTwoTone style={{ fontSize: '150%' }} onClick={e => onExpand(record, e)} />
                      )
                  }}
                  loading={loading}
                  rowKey={record => JSON.stringify(record.starttime)}
                  size='small'
                  onChange={handleChange}
                  showSorterTooltip={false}
                />
              </Skeleton>
            </div>
          </div>
        </div>
      </Carousel >
    </div >
  )
}

export default Overview
