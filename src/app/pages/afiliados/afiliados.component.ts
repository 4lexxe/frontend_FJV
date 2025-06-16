import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormsModule } from '@angular/forms';
import { AfiliadoService } from '../../services/afiliado.service';
import { Afiliado } from '../../interfaces/afiliado.interface';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-afiliados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QRCodeComponent, FormsModule],
  templateUrl: './afiliados.component.html',
})
export class AfiliadosComponent {
  form: FormGroup;

  afiliados: Afiliado[] = [];
  dniBusqueda = '';
  seleccionado: Afiliado | null = null;

  // Listas para selects
  categorias1: string[] = ['Jugador', 'Jugadora', 'Entrenador', 'Entrenadora', 'Arbitro', 'Arbitra', 'Planillero'];
  categorias2: string[] = [
    'Mini', 'Sub12', 'Sub14', 'Sub16', 'Sub18', 'Sub20', 'Mayores', 'Beach', 'Maxi', 'Newcom',
    'FJV Aspirante', 'FEVA Provincial N1', 'FEVA Provincial N2', 'FEVA Nacional N1', 'FEVA Nacional N2',
    'FIVB Internacional N1', 'FIVB Internacional N2', 'FIVB Internacional N3',
    'A.FJV Local', 'A.FJV Provincial', 'A.Cand.Nacional', 'A.FEVA Nacional', 'A.Cand. Continental',
    'Arbitro Continental', 'Arbitro Intenacional', 'Arbitro FIVB'
  ];
  categorias3: string[] = ['Local', 'Regional', 'Liga', 'Selección'];
  clubes: string[] = [
    'Sociedad Española de Jujuy', 'Sociedad Italiana de Jujuy', 'Club Atletico Gorriti', 'Direccion de Deportes',
    'Club Atletico Independiente', 'Club Atletico Ciudad de Nieva', 'Club Altos Hornos Zapla', 'Club Atletico Talleres',
    'Club Deportivo Universitario', 'Club Deportivo Lujan', 'Club Atletico General Lavalle', 'Club Gimnasia y Esgrima de Jujuy',
    'CIDEF Jujuy', 'Club Atletico San Pedro', 'Club Deportivo Sirio Voley', 'Club Sportivo Rivadavia', 'Los Ceibos Voley',
    'Club Academia de Voley', 'Club Amigos del Voley', 'Autoridades Tecnicas de Control'
  ];

  private ultimoNumeroAfiliacion = 1000; // número inicial que se irá incrementando

  constructor(private fb: FormBuilder, private servicio: AfiliadoService) {
    this.form = this.fb.group({
      apellidoNombre: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      fechaNacimiento: ['', Validators.required],
      // número afiliación se setea autogenerado y disabled para que no se edite manual
      numeroAfiliacion: [{ value: this.generarNumeroAfiliacion(), disabled: true }, Validators.required],
      tipoAfiliacion: ['FJV', Validators.required],
      categoria1: ['', Validators.required],
      categoria2: ['', Validators.required],
      categoria3: ['', Validators.required],
      fechaAlta: ['', Validators.required],
      club: ['', Validators.required],
      pase: ['Proveniente', Validators.required],
      clubDestino: [''],
      fechaPase: ['']
    });

    this.servicio.obtenerAfiliados().subscribe(a => this.afiliados = a);
  }

  generarNumeroAfiliacion(): number {
    this.ultimoNumeroAfiliacion++;
    return this.ultimoNumeroAfiliacion;
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Complete los campos obligatorios.');
      return;
    }

    // Como numeroAfiliacion está disabled, para enviarlo necesitamos obtener el valor explícitamente
    const nuevoAfiliado: Afiliado = {
      ...this.form.getRawValue(), // obtiene todos, incluidos disabled
      numeroAfiliacion: this.form.get('numeroAfiliacion')?.value
    };

    // Validar que no exista DNI duplicado
    const existe = this.afiliados.some(a => a.dni === nuevoAfiliado.dni);
    if (existe) {
      alert('Ya existe un afiliado con ese DNI.');
      return;
    }

    this.servicio.agregarAfiliado(nuevoAfiliado);
    alert('Afiliado guardado correctamente.');

    // Reseteo formulario con valores por defecto y nuevo número afiliación
    this.form.reset({
      tipoAfiliacion: 'FJV',
      pase: 'Proveniente',
      numeroAfiliacion: this.generarNumeroAfiliacion()
    });
  }

  buscar() {
    if (!this.dniBusqueda.trim()) {
      alert('Ingrese DNI para buscar.');
      return;
    }

    const encontrado = this.servicio.buscarPorDNI(+this.dniBusqueda);
    if (!encontrado) {
      alert('No se encontró afiliado con ese DNI.');
      this.seleccionado = null;
      return;
    }
    this.seleccionado = encontrado;
  }

  // Métodos para editar las listas con prompts
  editarCategorias(categoria: 'categoria1' | 'categoria2' | 'categoria3') {
    let lista: string[] = [];
    switch (categoria) {
      case 'categoria1': lista = this.categorias1; break;
      case 'categoria2': lista = this.categorias2; break;
      case 'categoria3': lista = this.categorias3; break;
    }

    const nuevaLista = prompt(`Editar ${categoria} (separar por coma)`, lista.join(', '));
    if (nuevaLista !== null) {
      const arr = nuevaLista.split(',').map(x => x.trim()).filter(x => x.length > 0);
      if (arr.length > 0) {
        switch (categoria) {
          case 'categoria1': this.categorias1 = arr; break;
          case 'categoria2': this.categorias2 = arr; break;
          case 'categoria3': this.categorias3 = arr; break;
        }
      }
    }
  }

  editarClubes() {
    const nuevaLista = prompt('Editar clubes (separar por coma)', this.clubes.join(', '));
    if (nuevaLista !== null) {
      const arr = nuevaLista.split(',').map(x => x.trim()).filter(x => x.length > 0);
      if (arr.length > 0) {
        this.clubes = arr;
      }
    }
  }
}
