import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TITLE_MESSAGES } from '../constants/stepper-data';
import { inject as service } from '@ember/service';
import { TOAST_OPTIONS } from '../constants/toast-options';
export default class StepperComponent extends Component {
  @service login;
  @service toast;
  @tracked preValid = false;
  @tracked isValid = JSON.parse(localStorage.getItem('isValid')) ?? false;
  @tracked currentStep = +localStorage.getItem('currentStep') ?? 0;
  TITLE_MESSAGES = TITLE_MESSAGES;
  @tracked stepOneData = JSON.parse(localStorage.getItem('stepOneData'));
  @tracked stepTwoData = JSON.parse(localStorage.getItem('stepTwoData'));
  @tracked stepThreeData = JSON.parse(localStorage.getItem('stepThreeData'));
  JOIN_URL = 'http://localhost:3000/users/self/intro'

  setIsValid = (newVal) => this.isValid = newVal;
  setIsPreValid = (newVal) => this.preValid = newVal;

  @action incrementStep(e) {
    if (this.currentStep < 5) {
      this.currentStep += 1;
      localStorage.setItem('currentStep', this.currentStep);
      console.log('inside increment')
    }
  }

  @action decrementStep() {
    if (this.currentStep > 0) {
      this.currentStep -= 1;
      localStorage.setItem('currentStep', this.currentStep);
    }
  }

  @action startHandler() {
    if (this.login.isLoggedIn && !this.login.isLoading) {
      localStorage.setItem('id', this.login.userData.id);
      localStorage.setItem('first_name', this.login.userData.first_name);
      localStorage.setItem('last_name', this.login.userData.last_name);
      this.incrementStep();
    }
  }

  @action nextStep(e) {
    e.preventDefault();
    this.incrementStep();
    localStorage.setItem('isValid', false);
    this.isValid = false;
  }

  @action async joinHandler(){
    const firstName = localStorage.getItem('first_name');
    const lastName = localStorage.getItem('last_name');
    const data = JSON.stringify({ firstName, lastName, ...this.stepOneData, ...this.stepTwoData, ...this.stepThreeData});
    try{
      const response = await fetch(this.JOIN_URL, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: data
      })

      if(response.status === 201){
        this.toast.success(
          'Successfully submitted the form',
          'Success!',
          TOAST_OPTIONS
        );
        this.incrementStep();
      }else if(response.status === 409){
        this.toast.error(
          'You have already filled the form',
          'User Exist!',
          TOAST_OPTIONS
        );
      }else{
        this.toast.error(
          'Some error occured',
          'Error ocurred!',
          TOAST_OPTIONS
        );
      }
    }catch(err){
      console.log('Error: ', err);
    }
  }
}
