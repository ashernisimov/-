// Break the Beet - Optimized Main JavaScript
(function(){'use strict';

// ===== Navigation Toggle =====
const initNavigation=()=>{
  const toggle=document.querySelector('.nav-toggle');
  const menu=document.querySelector('.nav-menu');
  const links=document.querySelectorAll('.nav-link');

  if(!toggle||!menu)return;

  toggle.addEventListener('click',()=>{
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });

  links.forEach(link=>{
    link.addEventListener('click',()=>{
      toggle.classList.remove('active');
      menu.classList.remove('active');
    });
  });

  // Set active link
  const currentPage=window.location.pathname.split('/').pop()||'index.html';
  links.forEach(link=>{
    if(link.getAttribute('href')===currentPage||(currentPage===''&&link.getAttribute('href')==='index.html')){
      link.classList.add('active');
    }
  });
};

// ===== Multi-Step Contact Form =====
const initContactForm=()=>{
  const form=document.getElementById('contactForm');
  if(!form)return;

  let currentStep=1;
  const totalSteps=2;
  const formData={};

  const steps=document.querySelectorAll('.form-step');
  const indicators=document.querySelectorAll('.step-indicator');
  const nextBtns=document.querySelectorAll('.btn-next');
  const prevBtns=document.querySelectorAll('.btn-prev');
  const submitBtn=document.querySelector('.btn-submit');

  const showStep=step=>{
    steps.forEach(s=>s.classList.remove('active'));
    const currentStepEl=document.querySelector(`[data-step="${step}"]`);
    if(currentStepEl)currentStepEl.classList.add('active');

    indicators.forEach((ind,idx)=>{
      ind.classList.remove('active','completed');
      if(idx+1<step)ind.classList.add('completed');
      else if(idx+1===step)ind.classList.add('active');
    });

    currentStep=step;
  };

  const validateStep=step=>{
    const stepEl=document.querySelector(`.form-step[data-step="${step}"]`);
    if(!stepEl)return false;

    const inputs=stepEl.querySelectorAll('input[required],select[required],textarea[required]');
    let isValid=true;

    inputs.forEach(input=>{
      if(!input.value.trim()){
        isValid=false;
        input.style.borderColor='#e74c3c';
        input.addEventListener('input',()=>input.style.borderColor='',{once:true});
      }
    });

    // Email validation
    if(step===1){
      const emailInput=stepEl.querySelector('input[type="email"]');
      if(emailInput&&emailInput.value&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)){
        isValid=false;
        emailInput.style.borderColor='#e74c3c';
      }
    }

    if(!isValid)alert('Please fill in all required fields correctly.');
    return isValid;
  };

  const saveStepData=step=>{
    const stepEl=document.querySelector(`.form-step[data-step="${step}"]`);
    if(!stepEl)return;

    const inputs=stepEl.querySelectorAll('input,select,textarea');
    inputs.forEach(input=>formData[input.name]=input.value);
  };

  const submitForm=()=>{
    console.log('Form submitted:',formData);

    form.style.display='none';
    const successMsg=document.querySelector('.form-success');
    if(successMsg)successMsg.classList.add('show');

    setTimeout(()=>{
      form.reset();
      showStep(1);
      if(successMsg)successMsg.classList.remove('show');
      form.style.display='block';
    },5000);
  };

  nextBtns.forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.preventDefault();
      if(validateStep(currentStep)){
        saveStepData(currentStep);
        if(currentStep<totalSteps)showStep(currentStep+1);
      }
    });
  });

  prevBtns.forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.preventDefault();
      if(currentStep>1)showStep(currentStep-1);
    });
  });

  if(submitBtn){
    submitBtn.addEventListener('click',e=>{
      e.preventDefault();
      if(validateStep(currentStep)){
        saveStepData(currentStep);
        submitForm();
      }
    });
  }

  showStep(1);
};

// ===== Sticky CTA =====
const initStickyCTA=()=>{
  const cta=document.querySelector('.sticky-cta');
  if(!cta)return;

  let ticking=false;

  const updateCTA=()=>{
    const scrolled=window.pageYOffset;
    if(scrolled>300){
      cta.classList.add('visible');
    }else{
      cta.classList.remove('visible');
    }
    ticking=false;
  };

  window.addEventListener('scroll',()=>{
    if(!ticking){
      window.requestAnimationFrame(updateCTA);
      ticking=true;
    }
  });
};

// ===== Smooth Scroll =====
const initSmoothScroll=()=>{
  document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
    anchor.addEventListener('click',function(e){
      const href=this.getAttribute('href');
      if(href!=='#'&&href!==''){
        const target=document.querySelector(href);
        if(target){
          e.preventDefault();
          window.scrollTo({
            top:target.offsetTop-80,
            behavior:'smooth'
          });
        }
      }
    });
  });
};

// ===== Gallery Modal =====
const initGallery=()=>{
  document.querySelectorAll('.gallery-item').forEach(item=>{
    item.addEventListener('click',function(){
      const img=this.querySelector('img');
      if(img&&img.src)window.open(img.src,'_blank');
    });
  });
};

// ===== Initialize All =====
const init=()=>{
  initNavigation();
  initContactForm();
  initStickyCTA();
  initSmoothScroll();
  initGallery();
};

// Run on DOM ready
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
}else{
  init();
}

})();
