<template>
  <admin-layout>
    <div class="product-manage-container">
      <div class="page-header">
        <h2 class="chinese-title">{{ pageTitle }}</h2>
        
        <div class="header-actions">
          <el-button type="primary" class="traditional-btn" @click="handleAddProduct">
            <el-icon><el-icon-plus /></el-icon> 添加商品
          </el-button>
        </div>
      </div>
      
      <!-- 搜索过滤 -->
      <div class="filter-container traditional-card">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="商品名称">
            <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable />
          </el-form-item>
          
          <el-form-item label="商品分类">
            <el-select v-model="searchForm.categoryId" placeholder="请选择分类" clearable style="width: 200px;">
              <el-option 
                v-for="item in categoryList" 
                :key="item.id" 
                :label="item.name" 
                :value="item.id" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="库存状态">
            <el-select v-model="searchForm.stockStatus" placeholder="请选择" clearable style="width: 200px;">
              <el-option label="库存充足" value="adequate" />
              <el-option label="库存不足" value="low" />
              <el-option label="已售罄" value="empty" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" class="traditional-btn" :class="productType === 0 ? 'memorial' : 'happy'" @click="handleSearch">
              <el-icon><el-icon-search /></el-icon> 搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 商品表格 -->
      <div class="product-table traditional-card mt-20">
        <el-table
          :data="productList"
          style="width: 100%"
          border
          v-loading="loading"
        >
          <el-table-column prop="id" label="商品ID" width="80" />
          <el-table-column prop="name" label="商品名称" min-width="150">
            <template #default="scope">
              <div class="product-name-cell">
                <el-avatar shape="square" :size="40" :src="scope.row.imageUrl" />
                <span class="ml-10">{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价" width="100">
            <template #default="scope">
              ¥{{ scope.row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="100">
            <template #default="scope">
              <span :class="getStockClass(scope.row.stock)">{{ scope.row.stock }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="categoryId" label="分类" width="120">
            <template #default="scope">
              <el-tag size="small">
                {{ getCategoryName(scope.row.categoryId) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="scope">
              <el-tooltip content="编辑商品" placement="top">
                <el-button 
                  link 
                  type="primary" 
                  size="small" 
                  @click="handleEdit(scope.row)"
                >
                  <el-icon><el-icon-edit /></el-icon> 编辑
                </el-button>
              </el-tooltip>
              
              <el-tooltip content="调整库存" placement="top">
                <el-button 
                  link 
                  type="success" 
                  size="small" 
                  @click="handleStockUpdate(scope.row)"
                >
                  <el-icon><el-icon-sell /></el-icon> 调库存
                </el-button>
              </el-tooltip>
              
              <el-popconfirm
                title="确定要删除该商品吗?"
                @confirm="handleDelete(scope.row.id)"
              >
                <template #reference>
                  <el-button 
                    link 
                    type="danger" 
                    size="small"
                  >
                    <el-icon><el-icon-delete /></el-icon> 删除
                  </el-button>
                </template>
              </el-popconfirm>
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
    
    <!-- 添加/编辑商品对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="productForm" :rules="productRules" ref="productFormRef" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="productForm.categoryId" placeholder="请选择商品分类" style="width: 100%">
            <el-option 
              v-for="item in categoryList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品单价" prop="price">
              <el-input-number v-model="productForm.price" :precision="2" :step="10" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存数量" prop="stock">
              <el-input-number v-model="productForm.stock" :step="1" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="商品图片" prop="image">
          <div class="upload-container">
            <el-upload
              class="product-image-uploader"
              action="/api/admin/upload" 
              :headers="uploadHeaders"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeUpload"
              list-type="picture-card"
              :limit="1"
              :file-list="fileList"
            >
              <template #default>
                <el-icon class="uploader-icon"><el-icon-plus /></el-icon>
                <div class="upload-text">点击上传</div>
              </template>
            </el-upload>
            <div class="image-tips">
              <p class="image-hint-title">图片要求：</p>
              <p class="image-hint">• 建议尺寸：200px × 200px</p>
              <p class="image-hint">• 支持格式：JPG/PNG</p>
              <p class="image-hint">• 文件大小：不超过2MB</p>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="使用说明" prop="description">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品使用说明"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            class="traditional-btn" 
            :class="productForm.categoryId === 0 ? 'memorial' : 'happy'" 
            @click="submitProductForm"
          >确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 调整库存对话框 -->
    <el-dialog
      title="调整库存"
      v-model="stockDialogVisible"
      width="400px"
    >
      <div class="stock-dialog-content">
        <div class="stock-product-info mb-20">
          <p><strong>商品名称：</strong>{{ currentProduct.name }}</p>
          <p><strong>当前库存：</strong>{{ currentProduct.stock }}</p>
        </div>
        
        <el-form :model="stockForm" label-width="80px">
          <el-form-item label="调整数量">
            <el-input-number v-model="stockForm.delta" :step="1" />
            <div class="hint-text">正数为入库，负数为出库</div>
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input v-model="stockForm.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="stockDialogVisible = false">取消</el-button>
          <el-button type="primary" class="traditional-btn" @click="submitStockUpdate">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </admin-layout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminLayout from '@/components/AdminLayout.vue'
import { 
  getProductList, 
  getProductDetail, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  updateProductStock,
  getCategoryList
} from '@/api/product'

const route = useRoute()
const loading = ref(false)

// 获取商品类型（0-白事，1-红事）
const productType = computed(() => {
  return Number(route.query.type || 0)
})

// 页面标题
const pageTitle = computed(() => {
  return productType.value === 0 ? '白事商品管理' : '喜事商品管理'
})

// 搜索表单
const searchForm = reactive({
  name: '',
  stockStatus: '',
  categoryId: ''
})

// 分页
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 分类列表
const categoryList = ref([])

// 商品列表数据
const productList = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('添加商品')
const productFormRef = ref(null)

// 当前选中的商品
const currentProduct = reactive({
  id: 0,
  name: '',
  stock: 0
})

// 商品表单
const productForm = reactive({
  id: 0,
  name: '',
  categoryId: '',
  price: 0,
  stock: 0,
  image: '',
  description: '',
  status: 1, // 默认上架状态
  updateTime: '' // 添加更新时间字段
})

// 表单验证规则
const productRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' },
  ],
  price: [
    { required: true, message: '请输入商品单价', trigger: 'blur' },
  ],
  stock: [
    { required: true, message: '请输入商品库存', trigger: 'blur' },
  ]
}

// 库存对话框
const stockDialogVisible = ref(false)
const stockForm = reactive({
  productId: 0,
  delta: 0
})

// 上传相关
const fileList = ref([])

const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
})

// 上传前检查
const beforeUpload = (file) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传JPG或PNG格式的图片!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB!')
    return false
  }
  return true
}

// 上传成功
const handleUploadSuccess = (response, uploadFile) => {
  productForm.image = response.data // 假设接口返回 {code: 200, data: '图片URL'}
  fileList.value = [{
    name: uploadFile.name,
    url: URL.createObjectURL(uploadFile.raw)
  }]
  ElMessage.success('上传成功')
}

// 上传失败
const handleUploadError = () => {
  ElMessage.error('上传失败')
}

// 初始化
onMounted(() => {
  fetchCategoryList()
  loadProductList()
})

// 获取分类列表
const fetchCategoryList = async () => {
  try {
    const data = await getCategoryList()
    categoryList.value = data || []
  } catch (error) {
    console.error('获取分类列表失败', error)
    ElMessage.error('获取分类列表失败')
  }
}

// 加载商品列表
const loadProductList = async () => {
  loading.value = true
  
  try {
    const params = {
      page: currentPage.value - 1, // 后端分页从0开始
      size: pageSize.value,
      // 仅传递非空字段
      ...(searchForm.name && { name: searchForm.name }),
      ...(searchForm.categoryId && { categoryId: searchForm.categoryId })
    }
    
    // 转换库存状态为查询条件
    if (searchForm.stockStatus) {
      if (searchForm.stockStatus === 'empty') {
        params.stockStatus = 'empty'
      } else if (searchForm.stockStatus === 'low') {
        params.stockStatus = 'low'
      }
    }
    
    const result = await getProductList(params)
    productList.value = result.records || []
    total.value = result.total || 0
  } catch (error) {
    console.error('加载商品列表失败', error)
    ElMessage.error('加载商品列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadProductList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.stockStatus = ''
  searchForm.categoryId = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  loadProductList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadProductList()
}

// 获取库存状态样式
const getStockClass = (stock) => {
  if (stock <= 0) return 'text-danger'
  if (stock < 10) return 'text-warning'
  return 'text-success'
}

// 添加商品
const handleAddProduct = () => {
  resetProductForm()
  dialogTitle.value = '添加商品'
  productForm.categoryId = productType.value
  dialogVisible.value = true
}

// 编辑商品
const handleEdit = async (row) => {
  resetProductForm()
  dialogTitle.value = '编辑商品'
  
  try {
    // 获取商品详情
    const productDetail = await getProductDetail(row.id)
    Object.assign(productForm, productDetail)
    
    // 如果有图片，设置文件列表
    if (productDetail.imageUrl) {
      fileList.value = [{
        name: '当前图片',
        url: productDetail.imageUrl
      }]
    }
    
    dialogVisible.value = true
  } catch (error) {
    console.error('获取商品详情失败', error)
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

// 重置商品表单
const resetProductForm = () => {
  if (productFormRef.value) {
    productFormRef.value.resetFields()
  }
  
  productForm.id = 0
  productForm.name = ''
  productForm.categoryId = ''
  productForm.price = 0
  productForm.stock = 0
  productForm.image = ''
  productForm.description = ''
  productForm.status = 1
  productForm.updateTime = ''
  
  // 重置文件列表
  fileList.value = []
}

// 提交商品表单
const submitProductForm = () => {
  productFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 如果是编辑操作，先获取最新数据进行比对
        if (productForm.id) {
          const latestProduct = await getProductDetail(productForm.id)
          
          // 检查数据是否已被其他用户修改
          if (latestProduct.updateTime && latestProduct.updateTime !== productForm.updateTime) {
            return ElMessageBox.confirm(
              '该商品数据已被其他用户修改，提交将覆盖最新修改，是否继续？', 
              '数据已更新', 
              {
                confirmButtonText: '继续提交',
                cancelButtonText: '取消',
                type: 'warning'
              }
            ).then(() => {
              // 用户确认继续，使用最新的updateTime
              productForm.updateTime = latestProduct.updateTime
              saveProductData()
            }).catch(() => {
              // 用户取消，刷新表单数据
              Object.assign(productForm, latestProduct)
              
              // 如果有图片，重新设置文件列表
              if (latestProduct.imageUrl) {
                fileList.value = [{
                  name: '当前图片',
                  url: latestProduct.imageUrl
                }]
              } else {
                fileList.value = []
              }
            })
          }
        }
        
        // 直接保存数据
        await saveProductData()
      } catch (error) {
        console.error('保存商品失败', error)
        ElMessage.error('保存商品失败: ' + (error.message || '未知错误'))
      }
    }
  })
}

// 实际保存商品数据
const saveProductData = async () => {
  try {
    // 构建提交数据
    const productData = {
      id: productForm.id,
      name: productForm.name,
      price: productForm.price,
      stock: productForm.stock,
      categoryId: productForm.categoryId,
      description: productForm.description,
      image: productForm.image,
      status: productForm.status,
      updateTime: productForm.updateTime // 传递更新时间用于乐观锁控制
    }
    
    if (productForm.id) {
      // 编辑商品
      await updateProduct(productForm.id, productData)
      // 获取最新数据更新表单，添加时间戳防止缓存
      const timestamp = new Date().getTime()
      const latestProduct = await getProductDetail(productForm.id, { _t: timestamp })
      
      console.log('保存后获取的最新商品数据:', latestProduct) // 添加日志，检查获取的数据
      
      // 确保所有字段都正确更新
      Object.keys(productForm).forEach(key => {
        if (key in latestProduct) {
          productForm[key] = latestProduct[key]
        }
      })
      
      ElMessage.success('更新商品成功')
    } else {
      // 添加商品
      const result = await addProduct(productData)
      // 如果后端返回了完整的商品数据，更新表单
      if (result && result.id) {
        console.log('添加商品后返回的数据:', result) // 添加日志，检查获取的数据
        
        Object.keys(productForm).forEach(key => {
          if (key in result) {
            productForm[key] = result[key]
          }
        })
      }
      ElMessage.success('添加商品成功')
    }
    
    // 更新列表后再关闭对话框，确保数据一致性
    await loadProductList() // 刷新列表
    dialogVisible.value = false
  } catch (error) {
    console.error('保存商品失败', error)
    ElMessage.error('保存商品失败: ' + (error.message || '未知错误'))
    throw error // 向上传递错误，让上层处理
  }
}

// 调整库存
const handleStockUpdate = async (row) => {
  try {
    loading.value = true
    
    // 添加时间戳，防止API缓存
    const timestamp = new Date().getTime()
    // 从服务器获取最新的商品数据
    const latestProduct = await getProductDetail(row.id, { _t: timestamp })
    
    console.log('库存调整窗口获取的商品数据:', latestProduct) // 添加日志，检查获取的数据
    
    // 使用最新数据设置当前产品信息
    Object.assign(currentProduct, {
      id: latestProduct.id,
      name: latestProduct.name,
      stock: latestProduct.stock,
      updateTime: latestProduct.updateTime
    })
    
    // 重置库存表单
    stockForm.productId = latestProduct.id
    stockForm.delta = 0
    stockForm.remark = ''
    
    stockDialogVisible.value = true
  } catch (error) {
    console.error('获取商品详情失败', error)
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

// 提交库存调整
const submitStockUpdate = async () => {
  try {
    // 再次获取最新库存数据进行比对，添加时间戳防止缓存
    const timestamp = new Date().getTime()
    const latestProduct = await getProductDetail(stockForm.productId, { _t: timestamp })
    
    console.log('提交库存调整前获取的最新数据:', latestProduct) // 添加日志
    
    // 如果库存已经被修改，提示用户
    if (latestProduct.stock !== currentProduct.stock) {
      return ElMessageBox.confirm(
        `当前库存已被修改(${currentProduct.stock} → ${latestProduct.stock})，是否仍要继续操作？`, 
        '库存已更新', 
        {
          confirmButtonText: '继续调整',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        // 用户确认继续，更新当前显示的库存值和其他数据
        Object.assign(currentProduct, {
          stock: latestProduct.stock,
          updateTime: latestProduct.updateTime
        })
        await processStockUpdate()
      }).catch(() => {
        // 用户取消，关闭对话框
        stockDialogVisible.value = false
        loadProductList() // 刷新列表
      })
    }
    
    // 正常进行库存调整
    await processStockUpdate()
  } catch (error) {
    console.error('调整库存失败', error)
    ElMessage.error('调整库存失败: ' + (error.message || '未知错误'))
  }
}

// 实际处理库存更新
const processStockUpdate = async () => {
  try {
    await updateProductStock({
      productId: stockForm.productId,
      delta: stockForm.delta,
      currentStock: currentProduct.stock, // 传递当前库存用于乐观锁控制
      remark: stockForm.remark
    })
    
    // 获取最新的商品数据，添加时间戳防止缓存
    const timestamp = new Date().getTime()
    const latestProduct = await getProductDetail(stockForm.productId, { _t: timestamp })
    
    console.log('库存调整后获取的最新数据:', latestProduct) // 添加日志
    
    // 更新当前显示的库存值和其他可能更新的数据
    Object.assign(currentProduct, {
      stock: latestProduct.stock,
      updateTime: latestProduct.updateTime
    })
    
    // 先更新列表，再关闭对话框
    await loadProductList() // 刷新列表
    ElMessage.success('库存调整成功')
    stockDialogVisible.value = false
  } catch (error) {
    ElMessage.error('调整库存失败: ' + (error.message || '未知错误'))
    throw error
  }
}

// 删除商品
const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该商品吗？此操作不可恢复', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteProduct(id)
      ElMessage.success('删除成功')
      loadProductList() // 刷新列表
    } catch (error) {
      console.error('删除商品失败', error)
      ElMessage.error('删除商品失败: ' + (error.message || '未知错误'))
    }
  }).catch(() => {})
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categoryList.value.find(item => item.id === categoryId)
  return category ? category.name : '未知分类'
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-container {
  padding: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.product-name-cell {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.stock-dialog-content {
  padding: 0 20px;
}

.hint-text {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 5px;
}

.text-danger {
  color: #f56c6c;
}

.text-warning {
  color: #e6a23c;
}

.text-success {
  color: #67c23a;
}

.mt-20 {
  margin-top: 20px;
}

.ml-10 {
  margin-left: 10px;
}

.upload-container {
  display: flex;
  align-items: flex-start;
  
  .image-tips {
    margin-left: 15px;
    padding: 10px 15px;
    background-color: #f9f9f9;
    border-radius: 4px;
    border-left: 3px solid #e6a23c;
    font-size: 12px;
    color: #606266;
    line-height: 1.5;
    flex: 1;
  }
  
  .image-hint-title {
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #303133;
  }
  
  .image-hint {
    margin-bottom: 6px;
  }
}

.product-image-uploader {
  .el-upload {
    width: 200px;
    height: 200px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.3s;
    position: relative;
    overflow: hidden;
    
    &:hover {
      border-color: var(--primary-color);
    }
  }
  
  .uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100%;
    height: 100%;
    text-align: center;
  }
  
  .upload-text {
    color: #8c939d;
    font-size: 12px;
    text-align: center;
    margin-top: 8px;
    position: absolute;
    width: 100%;
    bottom: 20px;
  }
  
  .el-upload-list__item {
    width: 200px !important;
    height: 200px !important;
  }
}

.uploaded-image {
  position: relative;
  width: 100%;
  height: 100%;
  
  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .image-actions {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    cursor: default;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s;
    background-color: rgba(0, 0, 0, 0.5);
    
    .el-icon {
      font-size: 20px;
      margin: 0 6px;
      color: #fff;
      cursor: pointer;
    }
  }
  
  &:hover .image-actions {
    opacity: 1;
  }
}
</style>