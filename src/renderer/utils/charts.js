import { uniq, compact, flatMap, uniqBy } from 'lodash'

export function calNodes(connectors) {
  let nodes = flatMap(connectors, c => {
    let topics = c.config.topics || c.config['connect.kcql.topics']

    if (topics) {
      let nodes = topics.split(',').map(t => {
        return t !== '' ? {
          name: ':' + t,
          itemStyle: {
            normal: {
              color: '#6f221b',
              borderColor: '#2233bb'
            }
          },
          type: 'topic'
        } : null
      })

      return compact(nodes).concat([{
        name: c.name,
        itemStyle: {
          normal: {
            color: c.type === 'sink' ? '#3a4f52' : '#72b3b4',
            borderColor: '#f010a0'
          }
        },
        type: c.type
      }])
    }

    return []
  })

  return compact(uniqBy(nodes
    .concat({
      name: ' ',
      itemStyle: {
        normal: {
          color: '#ffffff',
          borderColor: '#ffffff'
        }
      }
    },
    {
      name: '  ',
      itemStyle: {
        normal: {
          color: '#ffffff',
          borderColor: '#ffffff'
        }
      }
    }),
  c => c.name))
}

export function calLinks(connectors) {
  let links = flatMap(connectors, c => {
    let topics = c.config.topics || c.config['connect.kcql.topics']

    if (topics) {
      let tp = topics.split(',')

      return flatMap(tp.map(t => {
        if (t !== '') {
          let topic = ':' + t
          if (c.type === 'source') {
            return [
              {
                source: c.name,
                target: topic,
                value: 1,
                tooltip: uniq(c.tasks.map(t => t.worker_id)).length + ' worker(s)'
              },
              {
                source: topic,
                target: ' ',
                value: 0.0001,
                lineStyle: {
                  opacity: 0
                }
              }
            ]
          } else {
            return [
              {
                source: '  ',
                target: topic,
                value: 0.0001,
                lineStyle: {
                  opacity: 0
                }
              },
              {
                source: topic,
                target: c.name,
                value: 1,
                tooltip: uniq(c.tasks.map(t => t.worker_id)).length + ' worker(s)'
              }
            ]
          }
        } else {
          return null
        }
      }))
    }
    return []
  })

  return compact(uniq(links))
}
