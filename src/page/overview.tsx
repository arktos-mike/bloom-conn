import { LoomCard } from '@/components';
import { Carousel, List, Segmented, Skeleton, Tabs } from 'antd';
import { ScheduleOutlined, AppstoreOutlined, ReconciliationOutlined, HistoryOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

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
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState()
  const [machines, setMachines] = useState()
  const [period, setPeriod] = useState('shift')
  const div = useRef<HTMLDivElement | null>(null);
  const contentStyle = { height: height, margin: '1px' };
  let isSubscribed = true;

  const items = (groups || []).map(group => {
    return {
      label: <><AppstoreOutlined />{group['name']}</>, key: group['id'],
      children:
        <div style={{ height: height && height - 35, maxHeight: '100%', width: '100%', overflowY: 'auto', overflowX: 'hidden'}}>
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
                <LoomCard machine={item} period={period} />
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

              </Skeleton>
            </div>
          </div>
        </div>
      </Carousel >
    </div >
  )
}

export default Overview
