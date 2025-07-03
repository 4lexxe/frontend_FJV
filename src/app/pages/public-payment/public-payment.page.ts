import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PublicPaymentService, PublicPaymentData } from '../../services/public-payment.service';
import { PaymentMonitorService } from '../../services/payment-monitor.service';
import { NotificationService } from '../../services/notification.service';
import { PagoCobroComponent } from '../../components/mercado-pago/pago-cobro/pago-cobro.component';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-public-payment',
  standalone: true,
  imports: [CommonModule, PagoCobroComponent],
  templateUrl: './public-payment.page.html',
  styleUrls: ['./public-payment.page.css']
})
export class PublicPaymentPage implements OnInit, OnDestroy {
  paymentData: PublicPaymentData | null = null;
  isLoading = true;
  errorMessage = '';
  showPaymentModal = false;
  isMonitoring = false;
  slug = '';

  private paymentUpdatesSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicPaymentService: PublicPaymentService,
    private paymentMonitorService: PaymentMonitorService,
    private notificationService: NotificationService,
    private meta: Meta,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';

    if (!this.slug) {
      this.errorMessage = 'Enlace de pago no válido';
      this.isLoading = false;
      return;
    }

    this.loadPublicPayment();
    this.setupPaymentMonitoring();
  }

  ngOnDestroy(): void {
    if (this.paymentUpdatesSubscription) {
      this.paymentUpdatesSubscription.unsubscribe();
    }

    // Detener monitoreo al salir
    if (this.paymentData?.cobro.idCobro) {
      this.paymentMonitorService.stopMonitoring(this.paymentData.cobro.idCobro);
    }
  }

  private loadPublicPayment(): void {
    this.isLoading = true;

    // Registrar acceso
    this.publicPaymentService.registerAccess(this.slug).subscribe();

    // Cargar datos del pago
    this.publicPaymentService.getPublicPaymentBySlug(this.slug).subscribe({
      next: (data) => {
        this.paymentData = data;
        this.isLoading = false;
        this.updateMetaTags();
        this.updateMonitoringStatus();
      },
      error: (error) => {
        console.error('Error cargando pago público:', error);

        if (error.status === 404) {
          this.errorMessage = 'El enlace de pago no existe o ha expirado';
        } else if (error.status === 410) {
          this.errorMessage = 'Este enlace de pago ya no está disponible';
        } else {
          this.errorMessage = 'Error al cargar la información del pago';
        }

        this.isLoading = false;
      }
    });
  }

  private updateMetaTags(): void {
    if (!this.paymentData) return;

    const cobro = this.paymentData.cobro;
    const title = `Pagar: ${cobro.concepto} - Federación Jujeña de Voleibol`;
    const description = `Paga fácilmente ${this.formatCurrency(cobro.monto)} por ${cobro.concepto}. Métodos de pago seguros disponibles.`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: window.location.href });
  }

  private setupPaymentMonitoring(): void {
    this.paymentUpdatesSubscription = this.paymentMonitorService.getPaymentUpdates().subscribe(
      update => {
        if (update && this.paymentData && update.cobroId === this.paymentData.cobro.idCobro) {
          console.log(`🔄 Actualización detectada en pago público:`, update);

          // Actualizar estado del cobro
          this.paymentData.cobro.estado = update.newState as any;

          // Si se pagó, mostrar éxito y redirigir
          if (update.newState === 'Pagado') {
            this.showPaymentSuccess();
          }
        }
      }
    );
  }

  private updateMonitoringStatus(): void {
    if (this.paymentData?.cobro.idCobro) {
      this.isMonitoring = this.paymentMonitorService.isMonitoring(this.paymentData.cobro.idCobro);
    }
  }

  openPaymentModal(): void {
    if (this.canPay()) {
      this.showPaymentModal = true;
    }
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  onPaymentInitiated(): void {
    if (this.paymentData?.cobro.idCobro) {
      // Iniciar monitoreo del pago
      this.paymentMonitorService.startMonitoring(
        this.paymentData.cobro.idCobro,
        this.paymentData.cobro.estado
      );
      this.isMonitoring = true;

      this.notificationService.showInfo(
        '🚀 Pago Iniciado',
        'Se ha abierto la ventana de MercadoPago. El estado se actualizará automáticamente cuando se complete el pago.',
        10000
      );

      this.closePaymentModal();
    }
  }

  private showPaymentSuccess(): void {
    this.notificationService.showSuccess(
      '✅ ¡Pago Completado!',
      'Tu pago ha sido procesado exitosamente',
      8000
    );

    // Redirigir a página de éxito después de un momento
    setTimeout(() => {
      this.router.navigate(['/success'], {
        queryParams: {
          payment_id: 'public',
          status: 'approved',
          external_reference: this.paymentData?.cobro.idCobro
        }
      });
    }, 3000);
  }

  canPay(): boolean {
    if (!this.paymentData) return false;

    const estado = this.paymentData.cobro.estado;
    const linkActive = this.paymentData.paymentLink.isActive;

    return linkActive && (estado === 'Pendiente' || estado === 'Vencido');
  }

  isPaid(): boolean {
    return this.paymentData?.cobro.estado === 'Pagado';
  }

  isExpired(): boolean {
    if (!this.paymentData?.paymentLink.expirationDate) return false;
    return new Date() > new Date(this.paymentData.paymentLink.expirationDate);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }

  getStatusMessage(): string {
    if (!this.paymentData) return '';

    if (this.isPaid()) {
      return 'Este cobro ya ha sido pagado';
    }

    if (!this.paymentData.paymentLink.isActive) {
      return 'Este enlace de pago no está disponible';
    }

    if (this.isExpired()) {
      return 'Este enlace de pago ha expirado';
    }

    if (this.paymentData.cobro.estado === 'Anulado') {
      return 'Este cobro ha sido anulado';
    }

    return '';
  }

  getStatusClass(): string {
    if (!this.paymentData) return '';

    if (this.isPaid()) return 'alert-success';
    if (!this.paymentData.paymentLink.isActive || this.isExpired()) return 'alert-warning';
    if (this.paymentData.cobro.estado === 'Anulado') return 'alert-danger';

    return 'alert-info';
  }

  sharePage(): void {
    if (navigator.share) {
      navigator.share({
        title: `Pagar: ${this.paymentData?.cobro.concepto}`,
        text: `Paga fácilmente ${this.formatCurrency(this.paymentData?.cobro.monto || 0)} por ${this.paymentData?.cobro.concepto}`,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback - copiar al portapapeles
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.notificationService.showSuccess(
          '📋 Enlace Copiado',
          'El enlace ha sido copiado al portapapeles'
        );
      });
    }
  }
}
