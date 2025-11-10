import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { MessageModule } from 'primeng/message';
import { Router } from '@angular/router';
// import { AuthService } from '../service/auth-service';
import { LoginService } from '../../service/login-service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    DividerModule,
    MessageModule,
    RippleModule,
    TranslateModule,
    FloatLabelModule,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login implements OnInit {
  localStorage = window.localStorage;
  loginForm: FormGroup;
  loading = signal(false);
  success = signal(false);
  passwordVisible = signal(false);
  errorMessage = signal('');

  // ✅ Track current direction
  direction = signal<'rtl' | 'ltr'>('ltr');

  constructor(
    private fb: FormBuilder,
    private router: Router,
    // private authService: AuthService,
    private loginService: LoginService,
    public translate: TranslateService
  ) {
    // ✅ Supported languages
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('en');

    // ✅ Detect saved or default language
    const savedLang = this.localStorage.getItem('lang') || 'en';
    this.translate.use(savedLang);

    // ✅ Set HTML direction dynamically
    this.direction.set(savedLang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.lang = savedLang;
    document.documentElement.dir = this.direction();

    // ✅ Reactive effect: update <html dir> when signal changes
    effect(() => {
      document.documentElement.dir = this.direction();
      document.documentElement.lang = this.translate.currentLang;
    });

    // ✅ Build form
    this.loginForm = this.fb.group({
      username: ['']
    });
  }

  ngOnInit(): void {}

  // ✅ Language switcher
  switchLang(lang: string) {
    this.translate.use(lang);
    this.localStorage.setItem('lang', lang);
    this.direction.set(lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.lang = lang;
  }

  // ✅ Getters
  // get email() {
  //   return this.loginForm.get('email');
  // }

  // get password() {
  //   return this.loginForm.get('password');
  // }

  // togglePassword() {
  //   this.passwordVisible.update((v) => !v);
  // }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const payload = {
    "C_CODE": "13777",
    "CNTRY_CODE": "967",
    "C_BRN": "112",
    "C_SYS_NO": "203",
    "YR": "2025",
    "UNT": "38",
    "BRN_NO": "1",
    "USER_NO": "1",
    "HEX_C_CODE": "003C45",
    "LNG_NM": "en",
    "DEV_MODE": "dev"
}
console.log(this.loginForm.value.username);
    if(this.loginForm.value.username){this.loginService.login(payload).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res.status_code === 200) {
          this.router.navigate(['/chat']);
        } else {
          this.errorMessage.set(res.message || 'Login failed');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid credentials or server error');
      },
    });}
  }
}
