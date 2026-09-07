import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { CustomerProfile } from '../../models/domain.models';
import { MediaService, ProfileService } from '../../models/service.interfaces';
import { EditProfilePage } from './edit-profile.page';

describe('EditProfilePage', () => {
  const original: CustomerProfile = {
    id: '47',
    fullName: 'Staging Customer',
    email: 'customer@example.test',
    phone: '09171234567',
    licenseStatus: 'not_uploaded',
    notifications: { bookingUpdates: true, reminders: true, promotions: false },
  };

  it('saves notification preferences through the dedicated service', () => {
    let savedNotifications = original.notifications;
    const updated = {
      ...original,
      notifications: { ...original.notifications, promotions: true },
    };
    const profiles = {
      get: () => of(original),
      update: () => of(original),
      updateNotifications: (value: CustomerProfile['notifications']) => {
        savedNotifications = value;
        return of(updated);
      },
    } as ProfileService;
    const media = {} as MediaService;
    const page = new EditProfilePage(new FormBuilder(), profiles, media);
    page.ngOnInit();
    page.form.patchValue({ promotions: true });

    page.save();

    expect(savedNotifications.promotions).toBeTrue();
    expect(page.toastMessage()).toContain('updated');
  });

  it('uploads the selected profile photo when saving', () => {
    const file = new File(['photo'], 'avatar.png', { type: 'image/png' });
    const upload = { file: null as File | null };
    const updated = { ...original, profileImage: 'https://example.test/assets/avatars/new.png' };
    const profiles = {
      get: () => of(original),
      update: () => of(original),
      updateNotifications: () => of(original),
    } as ProfileService;
    const media = {
      pickImage: () => of({ name: file.name, previewUrl: 'blob:test-photo', file }),
      uploadProfilePhoto: (value: File) => {
        upload.file = value;
        return of(updated);
      },
    } as unknown as MediaService;
    const page = new EditProfilePage(new FormBuilder(), profiles, media);
    page.ngOnInit();
    page.pick();

    page.save();

    expect(upload.file).toBe(file);
    expect(page.image()).toBe(updated.profileImage!);
  });

  it('uploads a selected driver license and refreshes its status when saving', () => {
    const file = new File(['license'], 'license.png', { type: 'image/png' });
    const upload = { file: null as File | null };
    const pending = { ...original, licenseStatus: 'pending' as const };
    const profiles = {
      get: () => of(original),
      update: () => of(original),
      updateNotifications: () => of(original),
    } as ProfileService;
    const media = {
      pickImage: () => of({ name: file.name, previewUrl: 'blob:test-license', file }),
      uploadProfileLicense: (value: File) => {
        upload.file = value;
        return of(pending);
      },
    } as unknown as MediaService;
    const page = new EditProfilePage(new FormBuilder(), profiles, media);
    page.ngOnInit();

    page.pickLicense();
    page.save();

    expect(upload.file).toBe(file);
    expect(page.licenseStatus()).toBe('pending');
    expect(page.toastMessage()).toContain('updated');
  });
});
