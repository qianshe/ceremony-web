<template>
  <admin-layout>
    <div class="order-manage-container">
      <div class="page-header">
        <h2 class="chinese-title">订单管理</h2>
      </div>
      
      <!-- 搜索过滤 -->
      <div class="filter-container traditional-card">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="订单号">
            <el-input v-model="searchForm.orderId" placeholder="请输入订单号" clearable />
          </el-form-item>
          
          <el-form-item label="订单类型">
            <el-select v-model="searchForm.category" placeholder="请选择" clearable>
              <el-option label="白事订单" :value="0" />
              <el-option label="红事订单" :value="1" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="订单状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable>
              <el-option label="待确认" :value="0" />
              <el-option label="已确认" :value="1" />
              <el-option label="待配送" :value="2" />
              <el-option label="已完成" :value="3" />
              <el-option label="已取消" :value="4" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="下单日期">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" class="traditional-btn" @click="handleSearch">
              <el-icon><el-icon-search /></el-icon> 搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 订单表格 -->
      <div class="order-table traditional-card mt-20">
        <el-table
          :data="orderList"
          style="width: 100%"
          border
          v-loading="loading"
        >
          <el-table-column prop="orderId" label="订单号" width="180" />
          <el-table-column prop="userName" label="用户名称" width="120" />
          <el-table-column prop="category" label="订单类型" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.category === 0 ? 'info' : 'danger'" size="small">
                {{ scope.row.category === 0 ? '白事' : '红事' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="总金额" width="100">
            <template #default="scope">
              ¥{{ scope.row.totalAmount.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="订单状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="下单时间" width="150" />
          <el-table-column prop="deliveryType" label="配送方式" width="100">
            <template #default="scope">
              {{ scope.row.deliveryType === 0 ? '自提' : '配送' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="scope">
              <el-button size="small" @click="handleView(scope.row)">查看</el-button>
              <el-button 
                size="small" 
                type="primary" 
                @click="handleConfirm(scope.row)"
                v-if="scope.row.status === 0"
              >确认</el-button>
              <el-button 
                size="small" 
                type="success" 
                @click="handleComplete(scope.row)"
                v-if="scope.row.status === 1 || scope.row.status === 2"
              >完成</el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleCancel(scope.row)"
                v-if="scope.row.status !== 3 && scope.row.status !== 4"
              >取消</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    
    <!-- 订单详情对话框 -->
    <el-dialog
      title="订单详情"
      v-model="dialogVisible"
      width="700px"
    >
      <div class="order-detail" v-if="currentOrder.orderId">
        <div class="detail-header" :class="currentOrder.category === 0 ? 'memorial-detail' : 'happy-detail'">
          <div class="detail-status">
            <el-tag :type="getStatusType(currentOrder.status)" size="large">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </div>
          <div class="detail-id">订单号：{{ currentOrder.orderId }}</div>
        </div>
        
        <div class="detail-customer detail-section">
          <h3>用户信息</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item">
                <span class="detail-label">用户名称：</span>
                <span class="detail-value">{{ currentOrder.userName }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <span class="detail-label">联系电话：</span>
                <span class="detail-value">{{ currentOrder.phone }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div class="detail-order detail-section">
          <h3>订单信息</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">订单类型：</span>
                <span class="detail-value">
                  {{ currentOrder.category === 0 ? '白事' : '红事' }}
                </span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">配送方式：</span>
                <span class="detail-value">
                  {{ currentOrder.deliveryType === 0 ? '自提' : '配送' }}
                </span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">下单时间：</span>
                <span class="detail-value">{{ currentOrder.createTime }}</span>
              </div>
            </el-col>
          </el-row>
          
          <el-divider />
          
          <div class="product-list">
            <div class="table-header">
              <div class="col product-name">商品名称</div>
              <div class="col product-price">单价</div>
              <div class="col product-quantity">数量</div>
              <div class="col product-subtotal">小计</div>
            </div>
            
            <div 
              class="table-row"
              v-for="(item, index) in currentOrder.items"
              :key="index"
            >
              <div class="col product-name">{{ item.name }}</div>
              <div class="col product-price">¥{{ item.price.toFixed(2) }}</div>
              <div class="col product-quantity">{{ item.quantity }}</div>
              <div class="col product-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
            </div>
            
            <div class="table-footer">
              <div class="total-row">
                <div class="total-label">总计：</div>
                <div class="total-value">¥{{ currentOrder.totalAmount.toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-qrcode detail-section" v-if="currentOrder.qrCodeUrl">
          <h3>二维码信息</h3>
          <div class="qrcode-container">
            <div class="qrcode-image">
              <img :src="currentOrder.qrCodeUrl" alt="二维码" />
            </div>
            <div class="qrcode-tip">扫描二维码可查看订单详情</div>
          </div>
        </div>
        
        <div class="detail-remark detail-section" v-if="currentOrder.remark">
          <h3>备注信息</h3>
          <div class="remark-content">{{ currentOrder.remark }}</div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button 
            type="primary" 
            class="traditional-btn" 
            @click="handlePrint"
          >打印订单</el-button>
        </span>
      </template>
    </el-dialog>
  </admin-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from '../components/AdminLayout.vue'

// 搜索表单
const searchForm = reactive({
  orderId: '',
  category: '',
  status: '',
  dateRange: []
})

// 订单列表
const loading = ref(false)
const orderList = ref([
  {
    orderId: '20231105123456',
    userName: '张三',
    category: 0,
    totalAmount: 1680,
    status: 0,
    createTime: '2023-11-05 10:25:36',
    deliveryType: 1,
    phone: '137****6789',
    items: [
      { name: '寿衣-棉麻款', price: 1280, quantity: 1 },
      { name: '花圈-标准款', price: 188, quantity: 2 }
    ],
    qrCodeUrl: 'https://example.com/qr/123456.png',
    remark: '请于11月6日上午送达'
  },
  {
    orderId: '20231104567890',
    userName: '李四',
    category: 1,
    totalAmount: 2340,
    status: 1,
    createTime: '2023-11-04 15:38:22',
    deliveryType: 0,
    phone: '186****3456',
    items: [
      { name: '婚庆拱门', price: 680, quantity: 1 },
      { name: '喜宴餐具套装', price: 15.8, quantity: 100 }
    ],
    qrCodeUrl: 'https://example.com/qr/567890.png',
    remark: ''
  },
  {
    orderId: '20231103876543',
    userName: '王五',
    category: 0,
    totalAmount: 980,
    status: 3,
    createTime: '2023-11-03 09:14:55',
    deliveryType: 1,
    phone: '159****8901',
    items: [
      { name: '花圈-标准款', price: 188, quantity: 3 },
      { name: '祭品套装', price: 416, quantity: 1 }
    ],
    qrCodeUrl: 'https://example.com/qr/876543.png',
    remark: '请提前两小时送达'
  }
])

// 分页
const total = ref(100)
const pageSize = ref(10)
const currentPage = ref(1)

// 对话框
const dialogVisible = ref(false)
const currentOrder = reactive({
  orderId: '',
  userName: '',
  category: 0,
  totalAmount: 0,
  status: 0,
  createTime: '',
  deliveryType: 0,
  phone: '',
  items: [],
  qrCodeUrl: '',
  remark: ''
})

// 初始化
onMounted(() => {
  loadOrderList()
})

// 加载订单列表
const loadOrderList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待确认',
    1: '已确认',
    2: '待配送',
    3: '已完成',
    4: '已取消'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'primary',
    2: 'info',
    3: 'success',
    4: 'danger'
  }
  return typeMap[status] || 'info'
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadOrderList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.orderId = ''
  searchForm.category = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  loadOrderList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadOrderList()
}

// 查看订单
const handleView = (order) => {
  Object.assign(currentOrder, order)
  dialogVisible.value = true
}

// 确认订单
const handleConfirm = (order) => {
  ElMessageBox.confirm(`确定要确认订单 ${order.orderId} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟API请求
    setTimeout(() => {
      order.status = 1
      ElMessage.success('订单确认成功')
    }, 500)
  }).catch(() => {})
}

// 完成订单
const handleComplete = (order) => {
  ElMessageBox.confirm(`确定要将订单 ${order.orderId} 标记为已完成吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟API请求
    setTimeout(() => {
      order.status = 3
      ElMessage.success('订单已标记为完成')
    }, 500)
  }).catch(() => {})
}

// 取消订单
const handleCancel = (order) => {
  ElMessageBox.confirm(`确定要取消订单 ${order.orderId} 吗？此操作不可恢复`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟API请求
    setTimeout(() => {
      order.status = 4
      ElMessage.success('订单已取消')
    }, 500)
  }).catch(() => {})
}

// 打印订单
const handlePrint = () => {
  ElMessage.success('订单打印功能将在实际部署中实现')
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.page-header {
  margin-bottom: 20px;
}

.filter-container {
  padding: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.order-detail {
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-radius: 4px;
    margin-bottom: 20px;
    
    &.memorial-detail {
      background-color: rgba(93, 120, 150, 0.1);
      border-left: 4px solid var(--memorial-color);
    }
    
    &.happy-detail {
      background-color: rgba(198, 47, 47, 0.1);
      border-left: 4px solid var(--happy-color);
    }
    
    .detail-id {
      font-size: 16px;
      font-weight: bold;
    }
  }
  
  .detail-section {
    margin-bottom: 25px;
    
    h3 {
      font-size: 16px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    
    .detail-item {
      margin-bottom: 10px;
      
      .detail-label {
        color: var(--text-secondary);
        margin-right: 5px;
      }
      
      .detail-value {
        font-weight: 500;
      }
    }
  }
  
  .product-list {
    .table-header, .table-row {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    
    .table-header {
      font-weight: bold;
      color: var(--text-secondary);
    }
    
    .col {
      &.product-name {
        flex: 2;
      }
      
      &.product-price, &.product-quantity, &.product-subtotal {
        flex: 1;
        text-align: center;
      }
    }
    
    .table-footer {
      padding: 15px 0;
      display: flex;
      justify-content: flex-end;
      
      .total-row {
        display: flex;
        align-items: center;
        
        .total-label {
          margin-right: 10px;
          font-weight: bold;
        }
        
        .total-value {
          font-size: 18px;
          font-weight: bold;
          color: var(--primary-color);
        }
      }
    }
  }
  
  .qrcode-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .qrcode-image {
      width: 120px;
      height: 120px;
      border: 1px solid #eee;
      padding: 10px;
      margin-bottom: 10px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    
    .qrcode-tip {
      font-size: 12px;
      color: var(--text-light);
    }
  }
  
  .remark-content {
    padding: 10px 15px;
    background-color: #f9f9f9;
    border-radius: 4px;
    color: var(--text-secondary);
    border-left: 3px solid #eee;
  }
}
</style> 