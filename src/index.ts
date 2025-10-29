import { Context, Schema } from 'koishi'

export const name = 'icp-query'

export interface Config { }

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  // ICP 查询命令
  ctx.command('icp <domain>', 'ICP备案查询')
    .action(async (_, domain) => {
      if (!domain) return '请输入要查询的域名'

      try {
        // 简单的域名格式验证
        const domainRegex = /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
        if (!domainRegex.test(domain)) {
          return '域名格式不正确，请输入有效的域名'
        }

        const response = await ctx.http.get('https://icp.isyyo.com/query', {
          params: { domain }
        })

        if (!response.success || response.code !== 200) {
          return `查询失败: ${response.msg || '未知错误'}`
        }

        const list = response.params?.list
        if (!list || list.length === 0) {
          return `未找到域名 ${domain} 的备案信息`
        }

        const icpInfo = list[0]

        // 格式化返回信息
        return `域名: ${icpInfo.domain}
主办单位: ${icpInfo.unitName}
主办单位性质: ${icpInfo.natureName}
网站备案号: ${icpInfo.serviceLicence}
主办单位备案号: ${icpInfo.mainLicence}
网站内容类型: ${icpInfo.contentTypeName}
是否限制接入: ${icpInfo.limitAccess}
更新时间: ${icpInfo.updateRecordTime}`

      } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          return 'ICP查询服务暂时不可用，请稍后重试'
        }
        return `ICP查询失败: ${error.message}`
      }
    })

}
