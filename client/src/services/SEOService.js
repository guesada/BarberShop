/**
 * Serviço de SEO Avançado
 * Gerenciamento dinâmico de meta tags, structured data e otimizações SEO
 */
class SEOService {
  constructor() {
    this.defaultMeta = {
      title: 'BarberShop - Sistema Profissional de Agendamentos',
      description: 'Sistema completo para agendamento de serviços de barbearia com gestão profissional, agendamentos online e experiência premium.',
      keywords: 'barbearia, agendamento, corte, barba, salão, beleza, masculina, barbeiro, agendamento online',
      author: 'BarberShop Team',
      robots: 'index, follow',
      canonical: window.location.origin,
      image: `${window.location.origin}/icons/icon-512x512.png`,
      siteName: 'BarberShop',
      locale: 'pt_BR',
      type: 'website'
    };
    
    this.businessInfo = {
      name: process.env.REACT_APP_BUSINESS_NAME || 'BarberShop Elite',
      phone: process.env.REACT_APP_BUSINESS_PHONE || '+55 11 99999-9999',
      address: process.env.REACT_APP_BUSINESS_ADDRESS || 'Rua das Barbearias, 123 - São Paulo, SP',
      email: 'contato@barbershop.com',
      website: window.location.origin,
      openingHours: 'Mo-Fr 08:00-18:00, Sa 08:00-16:00',
      priceRange: '$$',
      rating: 4.8,
      reviewCount: 150
    };
    
    this.init();
  }

  /**
   * Inicializar serviço de SEO
   */
  init() {
    this.setupDefaultMeta();
    this.setupStructuredData();
    this.setupCanonicalURL();
    this.setupRobotsMeta();
    this.setupViewport();
    this.setupThemeColor();
    
    console.log('[SEO] Serviço inicializado');
  }

  /**
   * Configurar meta tags padrão
   */
  setupDefaultMeta() {
    this.setTitle(this.defaultMeta.title);
    this.setDescription(this.defaultMeta.description);
    this.setKeywords(this.defaultMeta.keywords);
    this.setAuthor(this.defaultMeta.author);
    this.setRobots(this.defaultMeta.robots);
  }

  /**
   * Definir título da página
   */
  setTitle(title, suffix = true) {
    const fullTitle = suffix && title !== this.defaultMeta.title 
      ? `${title} | ${this.businessInfo.name}`
      : title;
    
    document.title = fullTitle;
    this.setMetaTag('property', 'og:title', fullTitle);
    this.setMetaTag('name', 'twitter:title', fullTitle);
    
    // Atualizar structured data
    this.updateStructuredDataTitle(fullTitle);
  }

  /**
   * Definir descrição da página
   */
  setDescription(description) {
    this.setMetaTag('name', 'description', description);
    this.setMetaTag('property', 'og:description', description);
    this.setMetaTag('name', 'twitter:description', description);
  }

  /**
   * Definir palavras-chave
   */
  setKeywords(keywords) {
    this.setMetaTag('name', 'keywords', keywords);
  }

  /**
   * Definir autor
   */
  setAuthor(author) {
    this.setMetaTag('name', 'author', author);
  }

  /**
   * Definir robots
   */
  setRobots(robots) {
    this.setMetaTag('name', 'robots', robots);
  }

  /**
   * Definir imagem para compartilhamento
   */
  setImage(imageUrl, alt = '') {
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${window.location.origin}${imageUrl}`;
    
    this.setMetaTag('property', 'og:image', fullImageUrl);
    this.setMetaTag('property', 'og:image:alt', alt);
    this.setMetaTag('name', 'twitter:image', fullImageUrl);
    this.setMetaTag('name', 'twitter:image:alt', alt);
  }

  /**
   * Definir URL canônica
   */
  setCanonicalURL(url = window.location.href) {
    const canonical = url.split('?')[0].split('#')[0]; // Remove query params e hash
    
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
    
    this.setMetaTag('property', 'og:url', canonical);
  }

  /**
   * Configurar URL canônica
   */
  setupCanonicalURL() {
    this.setCanonicalURL();
  }

  /**
   * Configurar robots meta
   */
  setupRobotsMeta() {
    this.setRobots(this.defaultMeta.robots);
  }

  /**
   * Configurar viewport
   */
  setupViewport() {
    this.setMetaTag('name', 'viewport', 'width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover');
  }

  /**
   * Configurar theme color
   */
  setupThemeColor() {
    this.setMetaTag('name', 'theme-color', '#FF6B35');
    this.setMetaTag('name', 'msapplication-TileColor', '#FF6B35');
  }

  /**
   * Configurar dados estruturados (JSON-LD)
   */
  setupStructuredData() {
    // Schema.org para LocalBusiness
    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'HairSalon',
      name: this.businessInfo.name,
      description: this.defaultMeta.description,
      url: this.businessInfo.website,
      telephone: this.businessInfo.phone,
      email: this.businessInfo.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: this.businessInfo.address.split(' - ')[0],
        addressLocality: 'São Paulo',
        addressRegion: 'SP',
        addressCountry: 'BR'
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '18:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '08:00',
          closes: '16:00'
        }
      ],
      priceRange: this.businessInfo.priceRange,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: this.businessInfo.rating,
        reviewCount: this.businessInfo.reviewCount,
        bestRating: 5,
        worstRating: 1
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Serviços de Barbearia',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Corte de Cabelo',
              description: 'Corte profissional com acabamento premium'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Barba',
              description: 'Aparar e modelar barba com técnicas tradicionais'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Corte + Barba',
              description: 'Pacote completo de corte e barba'
            }
          }
        ]
      },
      sameAs: [
        'https://www.facebook.com/barbershop',
        'https://www.instagram.com/barbershop',
        'https://www.linkedin.com/company/barbershop'
      ]
    };

    // Schema.org para WebApplication
    const webAppSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: this.businessInfo.name,
      description: this.defaultMeta.description,
      url: this.businessInfo.website,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL'
      },
      featureList: [
        'Agendamento Online',
        'Gestão de Horários',
        'Notificações Push',
        'Modo Offline',
        'Interface Responsiva'
      ]
    };

    // Schema.org para Organization
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.businessInfo.name,
      url: this.businessInfo.website,
      logo: `${window.location.origin}/icons/icon-512x512.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: this.businessInfo.phone,
        contactType: 'customer service',
        availableLanguage: 'Portuguese'
      },
      sameAs: [
        'https://www.facebook.com/barbershop',
        'https://www.instagram.com/barbershop'
      ]
    };

    this.addStructuredData('local-business', localBusinessSchema);
    this.addStructuredData('web-application', webAppSchema);
    this.addStructuredData('organization', organizationSchema);
  }

  /**
   * Adicionar dados estruturados
   */
  addStructuredData(id, data) {
    let script = document.getElementById(`structured-data-${id}`);
    if (!script) {
      script = document.createElement('script');
      script.id = `structured-data-${id}`;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }

  /**
   * Atualizar título nos dados estruturados
   */
  updateStructuredDataTitle(title) {
    const webAppScript = document.getElementById('structured-data-web-application');
    if (webAppScript) {
      const data = JSON.parse(webAppScript.textContent);
      data.name = title;
      webAppScript.textContent = JSON.stringify(data);
    }
  }

  /**
   * Configurar meta tags para página específica
   */
  setPageMeta(pageConfig) {
    const {
      title,
      description,
      keywords,
      image,
      type = 'website',
      noindex = false,
      canonical
    } = pageConfig;

    if (title) this.setTitle(title);
    if (description) this.setDescription(description);
    if (keywords) this.setKeywords(keywords);
    if (image) this.setImage(image);
    if (canonical) this.setCanonicalURL(canonical);
    
    this.setMetaTag('property', 'og:type', type);
    
    if (noindex) {
      this.setRobots('noindex, nofollow');
    } else {
      this.setRobots('index, follow');
    }
  }

  /**
   * Configurar meta tags para página de login
   */
  setLoginPageMeta() {
    this.setPageMeta({
      title: 'Login',
      description: 'Faça login no BarberShop para acessar sua conta e gerenciar seus agendamentos.',
      keywords: 'login, entrar, conta, barbershop, agendamento',
      noindex: true
    });
  }

  /**
   * Configurar meta tags para página de registro
   */
  setRegisterPageMeta() {
    this.setPageMeta({
      title: 'Cadastro',
      description: 'Crie sua conta no BarberShop e comece a agendar seus serviços de barbearia.',
      keywords: 'cadastro, registro, conta, barbershop, agendamento',
      noindex: true
    });
  }

  /**
   * Configurar meta tags para dashboard
   */
  setDashboardPageMeta() {
    this.setPageMeta({
      title: 'Dashboard',
      description: 'Gerencie seus agendamentos e perfil no BarberShop.',
      keywords: 'dashboard, painel, agendamentos, perfil, barbershop',
      noindex: true
    });
  }

  /**
   * Configurar meta tags para página de agendamento
   */
  setAppointmentPageMeta(barberName = '') {
    const title = barberName ? `Agendar com ${barberName}` : 'Novo Agendamento';
    this.setPageMeta({
      title,
      description: `Agende seu horário ${barberName ? `com ${barberName}` : ''} no BarberShop. Escolha o melhor horário para você.`,
      keywords: 'agendamento, horário, barbeiro, corte, barba, barbershop'
    });
  }

  /**
   * Configurar meta tags para página de barbeiro
   */
  setBarberPageMeta(barber) {
    this.setPageMeta({
      title: `${barber.name} - Barbeiro`,
      description: `Conheça ${barber.name}, barbeiro especializado em ${barber.specialties?.join(', ')}. Agende seu horário no BarberShop.`,
      keywords: `${barber.name}, barbeiro, ${barber.specialties?.join(', ')}, barbershop`,
      image: barber.avatar,
      type: 'profile'
    });

    // Schema.org para Person
    const personSchema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: barber.name,
      jobTitle: 'Barbeiro',
      worksFor: {
        '@type': 'Organization',
        name: this.businessInfo.name
      },
      description: barber.bio,
      image: barber.avatar,
      aggregateRating: barber.rating ? {
        '@type': 'AggregateRating',
        ratingValue: barber.rating,
        bestRating: 5,
        worstRating: 1
      } : undefined
    };

    this.addStructuredData('barber-profile', personSchema);
  }

  /**
   * Definir meta tag
   */
  setMetaTag(attribute, value, content) {
    let meta = document.querySelector(`meta[${attribute}="${value}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, value);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  /**
   * Gerar sitemap dinâmico
   */
  generateSitemap() {
    const pages = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/login', priority: 0.3, changefreq: 'monthly' },
      { url: '/register', priority: 0.3, changefreq: 'monthly' },
      { url: '/dashboard', priority: 0.8, changefreq: 'daily' },
      { url: '/barbeiros', priority: 0.9, changefreq: 'weekly' },
      { url: '/servicos', priority: 0.8, changefreq: 'weekly' },
      { url: '/contato', priority: 0.6, changefreq: 'monthly' }
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${window.location.origin}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return sitemap;
  }

  /**
   * Gerar robots.txt
   */
  generateRobotsTxt() {
    return `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /login
Disallow: /register
Disallow: /admin

Sitemap: ${window.location.origin}/sitemap.xml`;
  }

  /**
   * Otimizar imagens para SEO
   */
  optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Adicionar alt text se não existir
      if (!img.alt && img.src) {
        const filename = img.src.split('/').pop().split('.')[0];
        img.alt = filename.replace(/[-_]/g, ' ');
      }

      // Adicionar loading lazy se não existir
      if (!img.loading) {
        img.loading = 'lazy';
      }

      // Adicionar decoding async
      if (!img.decoding) {
        img.decoding = 'async';
      }
    });
  }

  /**
   * Otimizar links para SEO
   */
  optimizeLinks() {
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
    externalLinks.forEach(link => {
      if (!link.rel) {
        link.rel = 'noopener noreferrer';
      }
      if (!link.target) {
        link.target = '_blank';
      }
    });
  }

  /**
   * Adicionar breadcrumbs estruturados
   */
  addBreadcrumbs(breadcrumbs) {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${window.location.origin}${crumb.url}`
      }))
    };

    this.addStructuredData('breadcrumbs', breadcrumbSchema);
  }

  /**
   * Configurar hreflang para múltiplos idiomas
   */
  setHreflang(languages) {
    // Remover hreflangs existentes
    document.querySelectorAll('link[hreflang]').forEach(link => link.remove());

    languages.forEach(lang => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang.code;
      link.href = `${window.location.origin}${lang.url}`;
      document.head.appendChild(link);
    });
  }

  /**
   * Analisar SEO da página atual
   */
  analyzePage() {
    const analysis = {
      title: {
        exists: !!document.title,
        length: document.title.length,
        optimal: document.title.length >= 30 && document.title.length <= 60
      },
      description: {
        exists: !!document.querySelector('meta[name="description"]'),
        length: document.querySelector('meta[name="description"]')?.content?.length || 0,
        optimal: false
      },
      headings: {
        h1: document.querySelectorAll('h1').length,
        h2: document.querySelectorAll('h2').length,
        h3: document.querySelectorAll('h3').length
      },
      images: {
        total: document.querySelectorAll('img').length,
        withAlt: document.querySelectorAll('img[alt]').length,
        withoutAlt: document.querySelectorAll('img:not([alt])').length
      },
      links: {
        internal: document.querySelectorAll(`a[href*="${window.location.hostname}"]`).length,
        external: document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])').length
      },
      canonical: !!document.querySelector('link[rel="canonical"]'),
      robots: !!document.querySelector('meta[name="robots"]'),
      structuredData: document.querySelectorAll('script[type="application/ld+json"]').length
    };

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      const length = description.content.length;
      analysis.description.optimal = length >= 120 && length <= 160;
    }

    return analysis;
  }

  /**
   * Gerar relatório de SEO
   */
  generateSEOReport() {
    const analysis = this.analyzePage();
    const issues = [];
    const recommendations = [];

    // Verificar título
    if (!analysis.title.exists) {
      issues.push('Título da página não encontrado');
    } else if (!analysis.title.optimal) {
      issues.push(`Título com ${analysis.title.length} caracteres (recomendado: 30-60)`);
    }

    // Verificar descrição
    if (!analysis.description.exists) {
      issues.push('Meta description não encontrada');
    } else if (!analysis.description.optimal) {
      issues.push(`Meta description com ${analysis.description.length} caracteres (recomendado: 120-160)`);
    }

    // Verificar headings
    if (analysis.headings.h1 === 0) {
      issues.push('Nenhum H1 encontrado');
    } else if (analysis.headings.h1 > 1) {
      issues.push('Múltiplos H1 encontrados');
    }

    // Verificar imagens
    if (analysis.images.withoutAlt > 0) {
      issues.push(`${analysis.images.withoutAlt} imagens sem alt text`);
    }

    // Verificar canonical
    if (!analysis.canonical) {
      issues.push('URL canônica não encontrada');
    }

    // Recomendações
    if (analysis.links.internal < 3) {
      recommendations.push('Adicionar mais links internos');
    }

    if (analysis.structuredData === 0) {
      recommendations.push('Adicionar dados estruturados');
    }

    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      analysis,
      issues,
      recommendations,
      score: this.calculateSEOScore(analysis, issues)
    };

    console.log('[SEO] Relatório gerado:', report);
    return report;
  }

  /**
   * Calcular pontuação de SEO
   */
  calculateSEOScore(analysis, issues) {
    let score = 100;
    
    // Penalidades por problemas
    score -= issues.length * 10;
    
    // Bônus por boas práticas
    if (analysis.title.optimal) score += 5;
    if (analysis.description.optimal) score += 5;
    if (analysis.headings.h1 === 1) score += 5;
    if (analysis.images.withoutAlt === 0) score += 5;
    if (analysis.canonical) score += 5;
    if (analysis.structuredData > 0) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Resetar meta tags para padrão
   */
  resetToDefault() {
    this.setupDefaultMeta();
    this.setCanonicalURL();
    
    // Remover dados estruturados específicos
    const specificSchemas = ['barber-profile', 'breadcrumbs'];
    specificSchemas.forEach(id => {
      const script = document.getElementById(`structured-data-${id}`);
      if (script) script.remove();
    });
  }
}

// Instância singleton
const seoService = new SEOService();

export default seoService;
