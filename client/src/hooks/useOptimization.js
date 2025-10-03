import { useState, useEffect, useCallback } from 'react';
import analyticsService from '../services/AnalyticsService';
import performanceService from '../services/PerformanceService';
import seoService from '../services/SEOService';
import cacheService from '../services/CacheService';
import resourceOptimizationService from '../services/ResourceOptimizationService';
import qualityMonitoringService from '../services/QualityMonitoringService';

/**
 * Hook para gerenciar otimizações avançadas
 * Integra analytics, performance, SEO, cache e qualidade
 */
export const useOptimization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [metrics, setMetrics] = useState({
    performance: {},
    analytics: {},
    seo: {},
    cache: {},
    quality: {}
  });
  const [optimizationScore, setOptimizationScore] = useState(0);

  // Inicializar serviços
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Aguardar inicialização de todos os serviços
        await Promise.all([
          analyticsService.init?.() || Promise.resolve(),
          performanceService.init?.() || Promise.resolve(),
          seoService.init?.() || Promise.resolve(),
          cacheService.init?.() || Promise.resolve(),
          resourceOptimizationService.init?.() || Promise.resolve(),
          qualityMonitoringService.init?.() || Promise.resolve()
        ]);

        setIsInitialized(true);
        console.log('[useOptimization] Todos os serviços inicializados');
      } catch (error) {
        console.error('[useOptimization] Erro na inicialização:', error);
      }
    };

    initializeServices();
  }, []);

  // Atualizar métricas periodicamente
  useEffect(() => {
    if (!isInitialized) return;

    const updateMetrics = () => {
      setMetrics({
        performance: performanceService.getCurrentMetrics?.() || {},
        analytics: analyticsService.getAnalyticsReport?.() || {},
        seo: seoService.analyzePage?.() || {},
        cache: cacheService.getStats?.() || {},
        quality: qualityMonitoringService.generateQualitySummary?.() || {}
      });
    };

    // Atualizar imediatamente
    updateMetrics();

    // Atualizar a cada 30 segundos
    const interval = setInterval(updateMetrics, 30000);

    return () => clearInterval(interval);
  }, [isInitialized]);

  // Calcular score de otimização
  useEffect(() => {
    const calculateOptimizationScore = () => {
      let totalScore = 0;
      let components = 0;

      // Performance Score (0-100)
      if (metrics.performance && Object.keys(metrics.performance).length > 0) {
        const perfScore = calculatePerformanceScore(metrics.performance);
        totalScore += perfScore;
        components++;
      }

      // SEO Score (0-100)
      if (metrics.seo && metrics.seo.score !== undefined) {
        totalScore += metrics.seo.score;
        components++;
      }

      // Cache Hit Rate (0-100)
      if (metrics.cache && metrics.cache.hitRate !== undefined) {
        totalScore += metrics.cache.hitRate;
        components++;
      }

      // Quality Score (0-100)
      if (metrics.quality && metrics.quality.score !== undefined) {
        totalScore += metrics.quality.score;
        components++;
      }

      const finalScore = components > 0 ? Math.round(totalScore / components) : 0;
      setOptimizationScore(finalScore);
    };

    calculateOptimizationScore();
  }, [metrics]);

  // Calcular score de performance
  const calculatePerformanceScore = (perfMetrics) => {
    let score = 100;
    
    // Penalizar métricas ruins
    Object.entries(perfMetrics).forEach(([metric, data]) => {
      if (data.current) {
        switch (metric) {
          case 'lcp':
            if (data.current > 2500) score -= 20;
            else if (data.current > 1800) score -= 10;
            break;
          case 'fid':
            if (data.current > 100) score -= 15;
            else if (data.current > 50) score -= 5;
            break;
          case 'cls':
            if (data.current > 0.1) score -= 15;
            else if (data.current > 0.05) score -= 5;
            break;
          case 'fcp':
            if (data.current > 1800) score -= 10;
            else if (data.current > 1200) score -= 5;
            break;
        }
      }
    });

    return Math.max(0, score);
  };

  // Otimizar página atual
  const optimizePage = useCallback(async () => {
    if (!isInitialized) return false;

    try {
      // Executar otimizações em paralelo
      await Promise.all([
        resourceOptimizationService.optimizePageResources?.() || Promise.resolve(),
        seoService.optimizeImages?.() || Promise.resolve(),
        seoService.optimizeLinks?.() || Promise.resolve(),
        cacheService.clearExpired?.() || Promise.resolve()
      ]);

      console.log('[useOptimization] Página otimizada');
      return true;
    } catch (error) {
      console.error('[useOptimization] Erro na otimização:', error);
      return false;
    }
  }, [isInitialized]);

  // Executar auditoria completa
  const runAudit = useCallback(async () => {
    if (!isInitialized) return null;

    try {
      const results = await Promise.all([
        performanceService.generatePerformanceReport?.() || Promise.resolve({}),
        seoService.generateSEOReport?.() || Promise.resolve({}),
        qualityMonitoringService.runQualityCheck?.() || Promise.resolve({}),
        cacheService.getStats?.() || Promise.resolve({})
      ]);

      const audit = {
        timestamp: Date.now(),
        performance: results[0],
        seo: results[1],
        quality: results[2],
        cache: results[3],
        score: optimizationScore
      };

      console.log('[useOptimization] Auditoria completa:', audit);
      return audit;
    } catch (error) {
      console.error('[useOptimization] Erro na auditoria:', error);
      return null;
    }
  }, [isInitialized, optimizationScore]);

  // Limpar todos os dados
  const clearAllData = useCallback(async () => {
    if (!isInitialized) return;

    try {
      await Promise.all([
        analyticsService.clearAnalyticsData?.() || Promise.resolve(),
        performanceService.clearPerformanceData?.() || Promise.resolve(),
        cacheService.clearAll?.() || Promise.resolve(),
        resourceOptimizationService.clearImageCache?.() || Promise.resolve(),
        qualityMonitoringService.clearQualityData?.() || Promise.resolve()
      ]);

      console.log('[useOptimization] Todos os dados limpos');
    } catch (error) {
      console.error('[useOptimization] Erro ao limpar dados:', error);
    }
  }, [isInitialized]);

  // Configurar SEO para página específica
  const setSEOData = useCallback((pageConfig) => {
    if (!isInitialized) return;

    try {
      seoService.setPageMeta?.(pageConfig);
    } catch (error) {
      console.error('[useOptimization] Erro ao configurar SEO:', error);
    }
  }, [isInitialized]);

  // Rastrear evento personalizado
  const trackEvent = useCallback((eventName, properties = {}) => {
    if (!isInitialized) return;

    try {
      analyticsService.track?.(eventName, properties);
    } catch (error) {
      console.error('[useOptimization] Erro ao rastrear evento:', error);
    }
  }, [isInitialized]);

  // Marcar início de operação
  const markStart = useCallback((operationName) => {
    if (!isInitialized) return;

    try {
      performanceService.markStart?.(operationName);
    } catch (error) {
      console.error('[useOptimization] Erro ao marcar início:', error);
    }
  }, [isInitialized]);

  // Marcar fim de operação
  const markEnd = useCallback((operationName) => {
    if (!isInitialized) return;

    try {
      performanceService.markEnd?.(operationName);
    } catch (error) {
      console.error('[useOptimization] Erro ao marcar fim:', error);
    }
  }, [isInitialized]);

  // Cache de dados
  const cacheData = useCallback(async (key, data, options = {}) => {
    if (!isInitialized) return false;

    try {
      return await cacheService.set?.(key, data, options) || false;
    } catch (error) {
      console.error('[useOptimization] Erro ao cachear dados:', error);
      return false;
    }
  }, [isInitialized]);

  // Obter dados do cache
  const getCachedData = useCallback(async (key, options = {}) => {
    if (!isInitialized) return null;

    try {
      return await cacheService.get?.(key, options) || null;
    } catch (error) {
      console.error('[useOptimization] Erro ao obter cache:', error);
      return null;
    }
  }, [isInitialized]);

  // Exportar relatório completo
  const exportReport = useCallback(async () => {
    if (!isInitialized) return;

    try {
      const audit = await runAudit();
      if (!audit) return;

      const report = {
        ...audit,
        exportedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimization_report_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      console.log('[useOptimization] Relatório exportado');
    } catch (error) {
      console.error('[useOptimization] Erro ao exportar relatório:', error);
    }
  }, [isInitialized, runAudit]);

  // Obter recomendações de otimização
  const getOptimizationRecommendations = useCallback(() => {
    const recommendations = [];

    // Recomendações de Performance
    if (metrics.performance.lcp?.current > 2500) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        message: 'Otimizar Largest Contentful Paint (LCP)',
        action: 'Comprimir imagens e otimizar recursos críticos'
      });
    }

    if (metrics.performance.fid?.current > 100) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        message: 'Reduzir First Input Delay (FID)',
        action: 'Otimizar JavaScript e reduzir tarefas longas'
      });
    }

    // Recomendações de Cache
    if (metrics.cache.hitRate < 70) {
      recommendations.push({
        category: 'cache',
        priority: 'medium',
        message: 'Melhorar taxa de acerto do cache',
        action: 'Revisar estratégias de cache e TTL'
      });
    }

    // Recomendações de SEO
    if (metrics.seo.score < 80) {
      recommendations.push({
        category: 'seo',
        priority: 'medium',
        message: 'Melhorar otimização SEO',
        action: 'Revisar meta tags e structured data'
      });
    }

    // Recomendações de Qualidade
    if (metrics.quality.score < 85) {
      recommendations.push({
        category: 'quality',
        priority: 'low',
        message: 'Melhorar qualidade do código',
        action: 'Corrigir violações de acessibilidade e SEO'
      });
    }

    return recommendations;
  }, [metrics]);

  return {
    // Estados
    isInitialized,
    metrics,
    optimizationScore,
    
    // Ações
    optimizePage,
    runAudit,
    clearAllData,
    exportReport,
    
    // SEO
    setSEOData,
    
    // Analytics
    trackEvent,
    
    // Performance
    markStart,
    markEnd,
    
    // Cache
    cacheData,
    getCachedData,
    
    // Utilitários
    getOptimizationRecommendations,
    
    // Serviços (para acesso direto se necessário)
    services: {
      analytics: analyticsService,
      performance: performanceService,
      seo: seoService,
      cache: cacheService,
      resourceOptimization: resourceOptimizationService,
      qualityMonitoring: qualityMonitoringService
    }
  };
};

export default useOptimization;
