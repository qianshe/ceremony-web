<template>
  <admin-layout>
    <div class="statistics-container">
      <div class="page-header">
        <h2 class="chinese-title">数据统计分析</h2>
        <div class="header-actions">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
          <el-button 
            type="primary" 
            class="traditional-btn ml-10" 
            @click="refreshData"
          >
            <el-icon><el-icon-refresh /></el-icon> 刷新
          </el-button>
        </div>
      </div>
      
      <!-- 总体统计卡片 -->
      <el-row :gutter="20">
        <el-col :sm="12" :md="6">
          <div class="statistic-card traditional-card">
            <div class="statistic-icon">
              <el-icon><el-icon-shopping-cart /></el-icon>
            </div>
            <div class="statistic-content">
              <div class="statistic-title">总订单数</div>
              <div class="statistic-value">{{ stats.totalOrders }}</div>
              <div class="statistic-trend" :class="{ 'up': stats.orderTrend > 0, 'down': stats.orderTrend < 0 }">
                {{ stats.orderTrend > 0 ? '+' : '' }}{{ stats.orderTrend }}%
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :sm="12" :md="6">
          <div class="statistic-card traditional-card">
            <div class="statistic-icon">
              <el-icon><el-icon-money /></el-icon>
            </div>
            <div class="statistic-content">
              <div class="statistic-title">总收入</div>
              <div class="statistic-value">¥{{ formatNumber(stats.totalRevenue) }}</div>
              <div class="statistic-trend" :class="{ 'up': stats.revenueTrend > 0, 'down': stats.revenueTrend < 0 }">
                {{ stats.revenueTrend > 0 ? '+' : '' }}{{ stats.revenueTrend }}%
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :sm="12" :md="6">
          <div class="statistic-card happy-card">
            <div class="statistic-icon">
              <el-icon><el-icon-present /></el-icon>
            </div>
            <div class="statistic-content">
              <div class="statistic-title">红事订单</div>
              <div class="statistic-value">{{ stats.happyOrders }}</div>
              <div class="statistic-trend" :class="{ 'up': stats.happyTrend > 0, 'down': stats.happyTrend < 0 }">
                {{ stats.happyTrend > 0 ? '+' : '' }}{{ stats.happyTrend }}%
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :sm="12" :md="6">
          <div class="statistic-card memorial-card">
            <div class="statistic-icon">
              <el-icon><el-icon-bangzhu /></el-icon>
            </div>
            <div class="statistic-content">
              <div class="statistic-title">白事订单</div>
              <div class="statistic-value">{{ stats.memorialOrders }}</div>
              <div class="statistic-trend" :class="{ 'up': stats.memorialTrend > 0, 'down': stats.memorialTrend < 0 }">
                {{ stats.memorialTrend > 0 ? '+' : '' }}{{ stats.memorialTrend }}%
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <!-- 图表分析 -->
      <el-row :gutter="20" class="mt-20">
        <el-col :sm="24" :lg="12">
          <div class="chart-card traditional-card">
            <div class="chart-header">
              <h3>订单趋势</h3>
              <div class="chart-actions">
                <el-radio-group v-model="trendTimeRange" size="small" @change="handleTrendTimeChange">
                  <el-radio-button label="week">本周</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                  <el-radio-button label="year">本年</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div class="chart-container" ref="trendChartRef">
              <!-- 趋势图表 -->
              <div class="chart-loading" v-if="trendLoading">
                <el-icon class="is-loading"><el-icon-loading /></el-icon>
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :sm="24" :lg="12">
          <div class="chart-card traditional-card">
            <div class="chart-header">
              <h3>红白事比例</h3>
            </div>
            <div class="chart-container" ref="pieChartRef">
              <!-- 饼图 -->
              <div class="chart-loading" v-if="pieLoading">
                <el-icon class="is-loading"><el-icon-loading /></el-icon>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <!-- 商品销量排行 -->
      <div class="chart-card traditional-card mt-20">
        <div class="chart-header">
          <h3>商品销量排行</h3>
          <div class="chart-actions">
            <el-radio-group v-model="productType" size="small" @change="handleProductTypeChange">
              <el-radio-button :label="1">红事商品</el-radio-button>
              <el-radio-button :label="0">白事商品</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="product-rank">
          <el-table
            :data="productRank"
            style="width: 100%"
            v-loading="rankLoading"
          >
            <el-table-column prop="rank" label="排名" width="80">
              <template #default="scope">
                <div class="rank-tag" :class="{ 
                    'top1': scope.row.rank === 1, 
                    'top2': scope.row.rank === 2, 
                    'top3': scope.row.rank === 3 
                  }"
                >
                  {{ scope.row.rank }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="商品名称" min-width="150" />
            <el-table-column prop="sales" label="销量" width="120" />
            <el-table-column prop="revenue" label="销售额" width="150">
              <template #default="scope">
                ¥{{ formatNumber(scope.row.revenue) }}
              </template>
            </el-table-column>
            <el-table-column prop="ratio" label="占比" width="120">
              <template #default="scope">
                <el-progress 
                  :percentage="scope.row.ratio" 
                  :color="productType === 1 ? '#c62f2f' : '#5d7896'"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import AdminLayout from '../components/AdminLayout.vue'
import api from '../api'

// 导入图表库
import * as echarts from 'echarts'

// 日期范围
const dateRange = ref([])

// 图表引用
const trendChartRef = ref(null)
const pieChartRef = ref(null)
let trendChart = null
let pieChart = null

// 加载状态
const trendLoading = ref(false)
const pieLoading = ref(false)
const rankLoading = ref(false)

// 筛选条件
const trendTimeRange = ref('month')
const productType = ref(1) // 默认红事商品

// 统计数据
const stats = reactive({
  totalOrders: 1286,
  orderTrend: 12.5,
  totalRevenue: 432560.80,
  revenueTrend: -3.2,
  happyOrders: 865,
  happyTrend: 15.3,
  memorialOrders: 421,
  memorialTrend: 8.4
})

// 商品销量排行
const productRank = ref([
  { rank: 1, name: '婚庆拱门', sales: 156, revenue: 106080, ratio: 100 },
  { rank: 2, name: '喜宴餐具套装', sales: 1428, revenue: 22562.40, ratio: 21.3 },
  { rank: 3, name: '婚庆喜字贴', sales: 582, revenue: 8730, ratio: 8.2 },
  { rank: 4, name: '婚庆气球', sales: 421, revenue: 4210, ratio: 4.0 },
  { rank: 5, name: '红包封', sales: 1024, revenue: 3072, ratio: 2.9 }
])

// 初始化
onMounted(() => {
  // 设置默认日期范围为最近30天
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  dateRange.value = [formatDate(start), formatDate(end)]
  
  // 初始化图表
  initCharts()
  
  // 加载数据
  refreshData()
})

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    // 订单趋势图
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value)
      renderTrendChart()
    }
    
    // 红白事比例图
    if (pieChartRef.value) {
      pieChart = echarts.init(pieChartRef.value)
      renderPieChart()
    }
    
    // 监听窗口大小变化，重新绘制图表
    window.addEventListener('resize', handleResize)
  })
}

// 处理窗口大小变化
const handleResize = () => {
  trendChart && trendChart.resize()
  pieChart && pieChart.resize()
}

// 刷新数据
const refreshData = async () => {
  try {
    // 获取统计概览数据
    const startDate = dateRange.value && dateRange.value[0] ? dateRange.value[0] : undefined
    const endDate = dateRange.value && dateRange.value[1] ? dateRange.value[1] : undefined
    
    const statsData = await api.dashboard.getDashboardStats({
      startDate,
      endDate
    })
    
    if (statsData && statsData.data) {
      const data = statsData.data
      // 更新统计数据
      stats.totalOrders = data.totalOrders || 0
      stats.orderTrend = data.orderTrend || 0
      stats.totalRevenue = data.totalRevenue || 0
      stats.revenueTrend = data.revenueTrend || 0
      stats.happyOrders = data.happyOrders || 0
      stats.happyTrend = data.happyTrend || 0
      stats.memorialOrders = data.memorialOrders || 0
      stats.memorialTrend = data.memorialTrend || 0
    }
    
    // 重新渲染图表
    renderTrendChart()
    renderPieChart()
    loadProductRank()
  } catch (error) {
    console.error('获取统计数据失败：', error)
  }
}

// 渲染趋势图
const renderTrendChart = async () => {
  trendLoading.value = true
  
  try {
    const params = {
      timeRange: trendTimeRange.value,
      startDate: dateRange.value && dateRange.value[0] ? dateRange.value[0] : undefined,
      endDate: dateRange.value && dateRange.value[1] ? dateRange.value[1] : undefined
    }
    
    const res = await api.dashboard.getOrderTrend(params)
    
    if (res && res.data) {
      const data = res.data
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['红事订单', '白事订单']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.xAxis || []
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '红事订单',
            type: 'line',
            smooth: true,
            data: data.happySeries || [],
            itemStyle: {
              color: '#c62f2f'
            }
          },
          {
            name: '白事订单',
            type: 'line',
            smooth: true,
            data: data.memorialSeries || [],
            itemStyle: {
              color: '#5d7896'
            }
          }
        ]
      }
      
      trendChart.setOption(option)
    }
  } catch (error) {
    console.error('获取订单趋势数据失败：', error)
  } finally {
    trendLoading.value = false
  }
}

// 渲染饼图
const renderPieChart = async () => {
  pieLoading.value = true
  
  try {
    const params = {
      startDate: dateRange.value && dateRange.value[0] ? dateRange.value[0] : undefined,
      endDate: dateRange.value && dateRange.value[1] ? dateRange.value[1] : undefined
    }
    
    const res = await api.dashboard.getCategoryDistribution(params)
    
    if (res && res.data) {
      const data = res.data
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: ['红事订单', '白事订单']
        },
        series: [
          {
            name: '订单比例',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { 
                value: data.happyCount || 0, 
                name: '红事订单', 
                itemStyle: { color: '#c62f2f' } 
              },
              { 
                value: data.memorialCount || 0, 
                name: '白事订单', 
                itemStyle: { color: '#5d7896' } 
              }
            ]
          }
        ]
      }
      
      pieChart.setOption(option)
    }
  } catch (error) {
    console.error('获取分类分布数据失败：', error)
  } finally {
    pieLoading.value = false
  }
}

// 加载商品排行
const loadProductRank = async () => {
  rankLoading.value = true
  
  try {
    const params = {
      type: productType.value,
      startDate: dateRange.value && dateRange.value[0] ? dateRange.value[0] : undefined,
      endDate: dateRange.value && dateRange.value[1] ? dateRange.value[1] : undefined
    }
    
    const res = await api.dashboard.getProductRank(params)
    
    if (res && res.data && res.data.list) {
      // 计算最高销售额用于占比计算
      const maxRevenue = res.data.list.length > 0 ? res.data.list[0].revenue : 0
      
      // 添加排名和占比
      productRank.value = res.data.list.map((item, index) => {
        return {
          ...item,
          rank: index + 1,
          ratio: maxRevenue > 0 ? (item.revenue / maxRevenue * 100).toFixed(1) : 0
        }
      })
    }
  } catch (error) {
    console.error('获取商品排行数据失败：', error)
  } finally {
    rankLoading.value = false
  }
}

// 商品类型变化处理
const handleProductTypeChange = () => {
  loadProductRank()
}

// 趋势时间范围变化处理
const handleTrendTimeChange = () => {
  renderTrendChart()
}

// 日期变化处理
const handleDateChange = () => {
  refreshData()
}

// 格式化数字
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.statistic-card {
  display: flex;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
  
  .statistic-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 20px;
    
    .el-icon {
      font-size: 30px;
      color: var(--text-primary);
    }
  }
  
  .statistic-content {
    flex: 1;
    
    .statistic-title {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 5px;
    }
    
    .statistic-value {
      font-size: 24px;
      font-weight: bold;
      color: var(--text-primary);
    }
    
    .statistic-trend {
      font-size: 12px;
      margin-top: 5px;
      
      &.up {
        color: #67c23a;
      }
      
      &.down {
        color: #f56c6c;
      }
    }
  }
}

.chart-card {
  margin-bottom: 20px;
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    h3 {
      font-size: 16px;
      margin: 0;
    }
  }
  
  .chart-container {
    height: 300px;
    position: relative;
  }
  
  .chart-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.7);
    
    .el-icon {
      font-size: 30px;
      color: var(--primary-color);
    }
  }
}

.rank-tag {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: white;
  background-color: #909399;
  
  &.top1 {
    background-color: #f56c6c;
  }
  
  &.top2 {
    background-color: #e6a23c;
  }
  
  &.top3 {
    background-color: #67c23a;
  }
}
</style> 