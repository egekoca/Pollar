import { useEffect, useId, useLayoutEffect, useRef, useState, memo } from 'react';
import './ElectricBorder.css';

interface ElectricBorderProps {
  children: React.ReactNode;
  color?: string;
  speed?: number;
  chaos?: number;
  thickness?: number;
  className?: string;
  style?: React.CSSProperties;
}

const ElectricBorder = memo(({ 
  children, 
  color = '#5227FF', 
  speed = 1, 
  chaos = 1, 
  thickness = 2, 
  className = '',
  style 
}: ElectricBorderProps) => {
  const rawId = useId().replace(/[:]/g, '');
  const filterId = `turbulent-displace-${rawId}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const strokeRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer to optimize performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 } // %10 görünür olduğunda tetikle
    );

    if (rootRef.current) {
      observer.observe(rootRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const updateAnim = () => {
    // ... (Mevcut animasyon kodu)
    if (!isVisible) return; // Görünür değilse güncelleme yapma

    const svg = svgRef.current;
    const host = rootRef.current;
    if (!svg || !host) return;

    // ... (Geri kalan kod aynı)
    if (strokeRef.current) {
      strokeRef.current.style.filter = `url(#${filterId})`;
    }

    const width = Math.max(1, Math.round(host.clientWidth || host.getBoundingClientRect().width || 0));
    const height = Math.max(1, Math.round(host.clientHeight || host.getBoundingClientRect().height || 0));

    const dyAnims = Array.from(svg.querySelectorAll('feOffset > animate[attributeName="dy"]'));
    if (dyAnims.length >= 2) {
      dyAnims[0].setAttribute('values', `${height}; 0`);
      dyAnims[1].setAttribute('values', `0; -${height}`);
    }

    const dxAnims = Array.from(svg.querySelectorAll('feOffset > animate[attributeName="dx"]'));
    if (dxAnims.length >= 2) {
      dxAnims[0].setAttribute('values', `${width}; 0`);
      dxAnims[1].setAttribute('values', `0; -${width}`);
    }

    const baseDur = 6;
    const dur = Math.max(0.001, baseDur / (speed || 1));
    [...dyAnims, ...dxAnims].forEach(a => a.setAttribute('dur', `${dur}s`));

    const disp = svg.querySelector('feDisplacementMap');
    if (disp) disp.setAttribute('scale', String(30 * (chaos || 1)));

    const filterEl = svg.querySelector(`#${CSS.escape(filterId)}`);
    if (filterEl) {
      filterEl.setAttribute('x', '-200%');
      filterEl.setAttribute('y', '-200%');
      filterEl.setAttribute('width', '500%');
      filterEl.setAttribute('height', '500%');
    }

    requestAnimationFrame(() => {
      [...dyAnims, ...dxAnims].forEach(a => {
        if (typeof (a as any).beginElement === 'function') {
          try {
            (a as any).beginElement();
          } catch {
            console.warn('ElectricBorder: beginElement failed, this may be due to a browser limitation.');
          }
        }
      });
    });
  };

  useEffect(() => {
    if (isVisible) {
      updateAnim();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed, chaos, isVisible]);

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    // ResizeObserver sadece görünürse çalışsın optimizasyonu yapılabilir ama
    // boyut değişince animasyon parametrelerinin güncellenmesi gerekir.
    // Yine de updateAnim içinde isVisible kontrolü olduğu için sorun olmaz.
    const ro = new ResizeObserver(() => {
      if (isVisible) updateAnim();
    });
    ro.observe(rootRef.current);
    
    if (isVisible) updateAnim();
    
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const vars: React.CSSProperties = {
    ['--electric-border-color' as string]: color,
    ['--eb-border-width' as string]: `${thickness}px`
  };

  return (
    <div ref={rootRef} className={`electric-border ${className}`} style={{ ...vars, ...style }}>
      {/* SVG içeriğini sadece görünürken veya mount edilince render etmek performansı artırır */}
      {/* Ancak layout shift olmaması için SVG her zaman DOM'da kalsın ama animasyonları dursun */}
      <svg ref={svgRef} className="eb-svg" aria-hidden focusable={false} style={{ display: isVisible ? 'block' : 'none' }}>
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
            {/* numOctaves değerini 10'dan 3'e düşürdüm - Performans için kritik */}
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves={3} result="noise1" seed={1} />
            <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
              <animate attributeName="dy" values="700; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>

            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves={3} result="noise2" seed={1} />
            <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
              <animate attributeName="dy" values="0; -700" dur="6s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>

            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves={3} result="noise1" seed={2} />
            <feOffset in="noise1" dx="0" dy="0" result="offsetNoise3">
              <animate attributeName="dx" values="490; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>

            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves={3} result="noise2" seed={2} />
            <feOffset in="noise2" dx="0" dy="0" result="offsetNoise4">
              <animate attributeName="dx" values="0; -490" dur="6s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>

            <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
            <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
            <feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="combinedNoise"
              scale={30}
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>

      <div className="eb-layers">
        {/* Stroke filtresi sadece görünürken aktif olsun */}
        <div ref={strokeRef} className="eb-stroke" style={{ filter: isVisible ? `url(#${filterId})` : 'none' }} />
        <div className="eb-glow-1" />
        <div className="eb-glow-2" />
        <div className="eb-background-glow" />
      </div>

      <div className="eb-content">{children}</div>
    </div>
  );
});

export default ElectricBorder;


